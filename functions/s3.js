import React from 'react'


const fetchSendAudio = (title, formData, id) => fetch('https://thejoury.com/autonotes/signaturenine.php?action=postPost&title=' + title + '&id=' + id,{
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: formData
        })
        .then((response) => response.json())
            .then((json) => {
              return json
            });

const fetchGetTranscription = (title) => fetch('https://thejoury.com/autonotes/getbucket.php?title=' + title,{
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: "authorized"
        })
        .then((response) => {
          var empty_json = ""
          try {
            empty_json = response.json();
          } catch (e) {
            console.log(response.json())
              return {status: "404", message: "not transcribed"};
          }
          return empty_json
          
          });

const fetchPresignedUrl = (title) => fetch('https://thejoury.com/autonotes/presigned.php?title=' + title,{
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: "authorized"
        })
        .then((response) => response.json())
            .then((json) => {
              return json
          });



export async function sendAudioFunction(title, formData, id) {
  const fetchReturn = await fetchSendAudio(title, formData, id)
  return fetchReturn
}

export async function getTranscriptionFunction(title) {
  const fetchReturn = await fetchGetTranscription(title)
  console.log(fetchReturn)
  return fetchReturn
}

export async function getPresignedUrlFunction(title) {
  const fetchReturn = await fetchPresignedUrl(title)
  console.log(fetchReturn)
  return fetchReturn
}