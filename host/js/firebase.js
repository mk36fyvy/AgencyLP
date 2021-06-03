function dataCallback(response) {
    console.log('dataCallback', response);

    const form = document.querySelector('.form');

    const inputName = form.querySelector('#name');
    const inputEmail = form.querySelector('#email');
    const inputMessage = form.querySelector('#message');

    if (inputName.value == '') {
        return alert('Bitte gib deinen Namen ein.');
    } else if (inputEmail.value == '') {
        return alert('Bitte gib deine Email-Adresse ein.');
    } else if (inputMessage.value.length <= 10) {
        return alert(
            'Bitte beschreib uns ausführlich (über 10 Zeichen), was wir für dich tun können.'
        );
    }

    let msg = {
        name: inputName.value,
        email: inputEmail.value,
        text: inputMessage.value,
    };

    axios
        .post('/checkRecaptcha', {
            resp: encodeURIComponent(response),
            msg,
        })
        .then(function (resp) {
            const status = resp.status;
            //redirect logic
            if (status == 200) {
                // form.querySelector('#name').value = '';
                // form.querySelector('#email').value = '';
                // form.querySelector('#message').value = '';
                window.location = '/sendSuccess';
            }
        })
        .catch((e) => {
            console.error(e);
        });
}
function dataExpiredCallback() {
    console.log('dataExpiredCallback');
}

function post(path, params, method = 'post') {
    const form = document.createElement('form');
    form.method = method;
    form.action = path;

    for (const key in params) {
        if (params.hasOwnProperty(key)) {
            const hiddenField = document.createElement('input');
            hiddenField.type = 'hidden';
            hiddenField.name = key;
            hiddenField.value = params[key];

            form.appendChild(hiddenField);
        }
    }

    document.body.appendChild(form);
    form.submit();
}

//grab a form

//grab an input

// //config your firebase push
// var config = {
//     apiKey: 'AIzaSyCnhJ0lRhn14r_L6HTrSnfvLtj98pTW1Ss',
//     authDomain: 'https://agencylp-d3100.firebaseapp.com',
//     databaseURL:
//         'https://agencylp-d3100-default-rtdb.europe-west1.firebasedatabase.app',
//     projectId: 'agencylp-d3100',
//     storageBucket: 'agencylp-d3100.appspot.com',
//     messagingSenderId: '902024600190',
//     appId: '1:902024600190:web:31596ff5166d8d37cf562f',
//     measurementId: 'G-XT2E0W6PG0',
// };

//create a functions to push
// function firebasePush(input) {
//     //prevents from braking
//     if (!firebase.apps.length) {
//         firebase.initializeApp(config);
//     }
//     // Import Admin SDK
//     // var admin = require('firebase-admin');

//     // Get a database reference to our blog
//     // var db = firebase.getInstance();

//     //push itself
//     var ref = firebase.database().ref('emails').push();
//     ref.set(input);
// }

//push on form submit
// if (form) {
//     form.addEventListener('submit', function (evt) {
//         evt.preventDefault();

//         if (inputName.value == '') {
//             return alert('Bitte gib deinen Namen ein.');
//         } else if (inputEmail.value == '') {
//             return alert('Bitte gib deine Email-Adresse ein.');
//         } else if (inputMessage.value.length <= 10) {
//             return alert(
//                 'Bitte beschreib uns ausführlich (über 10 Zeichen), was wir für dich tun können.'
//             );
//         }

//         // let input = {
//         //     name: inputName.value,
//         //     email: inputEmail.value,
//         //     message: inputMessage.value,
//         // };

//         firebasePush(input);

//         inputName.value = '';
//         inputEmail.value = '';
//         inputMessage.value = '';

//         //shows alert if everything went well.
//         return alert(
//             `Die Anfrage wurde erfolgreich versendet.\nVielen Dank für Ihr Interesse!`
//         );
//     });
// }
