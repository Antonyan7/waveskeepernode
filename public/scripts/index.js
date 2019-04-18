window.addEventListener('load', () => {
  const authForm = document.getElementById('authForm');
  const emailField = document.getElementById('email');
  const successMessage = document.getElementById('successMessage');
  /*
  * auth facilitates input of the following data

name – name of the service (optional field)
data – a line with any data (required field)
referrer – a websites' full URL for redirect (optional field)
icon – path to the logo relative to the referrer or origin of the website (optional field)
successPath – relative path to the website's Auth API (optional field)
  * */
  authForm.addEventListener('submit', (event) => {
    event.preventDefault();
    if (WavesKeeper) {
      const authData = { data: emailField.value };
      WavesKeeper.auth(authData)
        .then((auth) => {
          console.log(auth); // displaying the result on the console

          const xhttp = new XMLHttpRequest();
          xhttp.onreadystatechange = function () {
            if (this.readyState === 4 && this.status === 200) {
              successMessage.style.display = 'block';
              setTimeout(() => {
                successMessage.style.display = 'none';
              }, 3000);
            }
          };
          xhttp.open('POST', 'user/auth', true);
          xhttp.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
          xhttp.send(`publicKey=${auth.publicKey}&email=${emailField.value}`);
          //   xhttp.send({
          //   publicKey: auth,
          //   email: emailField.value,
          // });
          /* ...processing data */
        }).catch((error) => {
          console.error(error); // displaying the result on the console
          /* ...processing errors */
        });
    }
  });
});
