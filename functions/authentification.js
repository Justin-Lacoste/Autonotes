const fetchSignUp = (email, password) => fetch('https://thejoury.com/autonotes/signup.php?email=' + email + "&password=" + password, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: "authorized"
        })
        .then((response) => response.json())
            .then((json) => {
              return json
            });


export async function signUpFunction(email, password) {
  console.log("inf signup")
  const fetchReturn = await fetchSignUp(email, password)
  console.log("fetch return, ", fetchReturn)
  return fetchReturn
}