document.addEventListener('DOMContentLoaded', function () {
	M.AutoInit();
	let elem = document.getElementById('modal1');
	let elem2 = document.getElementById('modal2');
	let instance = M.Modal.init(elem, { dismissible: false });
	let instance2 = M.Modal.init(elem2);
	let fotoPerfil = document.getElementById('fotoPerfil');
	let btnFAcebook = document.getElementById('btnFacebook');
	let btnGoogle = document.getElementById('btnGoogle');
	let btnLogout = document.getElementsByClassName('logout');
	let nome = document.getElementById('nome');
	let nickname = document.getElementById('nickname');
	let save = document.getElementById('save');
	let roll = document.getElementById('roll');
	let qtd = document.getElementById('qtd');
	let modificador = document.getElementById('modificador');
	let rolagens = document.getElementById('rolagens').getElementsByTagName('tbody')[0];
	let data = {};

	let config = {
		apiKey: "",
		authDomain: "",
		databaseURL: "",
		projectId: "",
		storageBucket: "",
		messagingSenderId: ""
	};

	if (!firebase.apps.length) {
		firebase.initializeApp(config);
	}
	for (let i = 0; i < btnLogout.length; i++) {
		btnLogout[i].addEventListener('click', function () {
			firebase.auth().signOut().then(function () {
				// Sign-out successful.
			}).catch(function (error) {
				// An error happened.
			});
		});
	}


	firebase.auth().onAuthStateChanged(function (user) {

		if (user) {
			console.log(user.displayName.split(" "));
			let firstName = user.displayName.split(" ")[0];
			let dados = firebase.database().ref('jogadores/');
			dados.on('value', function (snapshot) {
				if (snapshot.val() != null) {
					snapshot.forEach(function (item) {
						if (firstName === item.val().jogador.split(" ")[0]) {
							console.log(item.val());
							data.nick = item.val().nickname;
							nickname.value = item.val().nickname;
							nickname.disabled = true;
							save.disabled = true;
						}
					})
				}
			});
			fotoPerfil.src = user.photoURL;
			nome.innerHTML = user.displayName;
			data.uid = user.uid;
			data.jogador = user.displayName;

			//if (){
			var datas = firebase.database().ref('jogadores/' + data.uid);
			datas.on('value', function (snapshot) {
				if (snapshot.val() != null) {
					console.log("nada");
					data.nick = snapshot.val().nickname;
					nickname.value = snapshot.val().nickname;
					nickname.disabled = true;
					save.disabled = true;
				}
			});
			//}

		} else {
			instance.open();
			btnFAcebook.addEventListener('click', function () {
				let provider = new firebase.auth.FacebookAuthProvider();
				firebase.auth().signInWithRedirect(provider);
				firebase.auth().getRedirectResult().then(function (result) {
					if (result.credential) {
					}
					let user = result.user;
				}).catch(function (error) {
				});
			});
			btnGoogle.addEventListener('click', function () {
				let provider = new firebase.auth.GoogleAuthProvider();
				firebase.auth().signInWithRedirect(provider);
				firebase.auth().getRedirectResult().then(function (result) {
					if (result.credential) {
					}
					let user = result.user;
					console.log(user);

				}).catch(function (error) {
				});
			});
		}
	});

	function zeraTable() {
		rolagens.innerHTML = '';
	}

	function addLinha(cel1, cel2, cel3, cel4, cel5) {
		let txt = "Jogador:%20" + cel1 + "%0ADado:%20" + cel2 + "%0AModificador:%20" + cel3 + "%0AHorario:%20" + cel5 + "%0AValor:%20" + "%2A" + cel4 + "%2A";
		console.log(txt)
		let row = rolagens.insertRow(0);
		let cell1 = row.insertCell(0);
		let cell2 = row.insertCell(1);
		let cell3 = row.insertCell(2);
		let cell4 = row.insertCell(3);
		let cell5 = row.insertCell(4);
		let cell6 = row.insertCell(5);
		cell1.innerHTML = cel1;
		cell2.innerHTML = cel2;
		cell3.innerHTML = cel3;
		cell4.innerHTML = cel4;
		cell5.innerHTML = cel5;
		cell6.innerHTML = "<a href='whatsapp://send?text=" + txt + "'><i class='fab fa-whatsapp whatsapp'></i></a>";
	}

	let datas = firebase.database().ref('jogadas/');
	datas.on('value', function (snapshot) {
		if (snapshot.val() != null) {
			zeraTable();
			snapshot.forEach(function (item) {
				addLinha(item.val().nick, item.val().dado, item.val().mod, item.val().result, item.val().horario);
			})
		}
	});

	function getRandomIntInclusive(min, max) {
		min = Math.ceil(min);
		max = Math.floor(max);
		return Math.floor(Math.random() * (max - min + 1)) + min;
	}

	for (let i = 0; i <= 6; i++) {
		const dice = ['4', '6', '8', '10', 'P', '12', '20']
		document.getElementById('d' + dice[i]).addEventListener('click', function () {
			let mod = (!!modificador.value) ? parseInt(modificador.value) : 0;
			let qtds = (!!qtd.value) ? parseInt(qtd.value) : 1;
			let result = 0;
			if (dice[i] === 'P') {
				let dado = 100;
				result = getRandomIntInclusive(1, dado);

				saveJogadas(data.nick, qtds, dado, mod, result)

			} else {
				let dado = parseInt(dice[i]);
				for (let j = 0; j < qtds; j++) {
					result += getRandomIntInclusive(1, dado);
				}
				result = result + mod;
				saveJogadas(data.nick, qtds, dado, mod, result)
			}
		});
	}

	function saveJogadas(nick, qtds, dado, mod, result) {
		const time = new Date();
		let database = firebase.database();
		let newJogada = firebase.database().ref().child('jogadas').push().key;
		const jogadas = {
			nick,
			dado: qtds + 'd' + dado,
			mod,
			result,
			horario: time.toLocaleTimeString()
		}
		let updates = {};
		updates['/jogadas/' + newJogada] = jogadas;
		instance2.close();
		return database.ref().update(updates);
	}

	save.addEventListener('click', function () {
		let database = firebase.database();
		data.nickname = nickname.value;
		nickname.disabled = true;
		save.disabled = true;
		let updates = {};
		updates['/jogadores/' + data.uid] = data;

		return database.ref().update(updates);
	})


});