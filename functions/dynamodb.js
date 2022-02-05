const fetchAddClassToDb = (title, subject_id, subject, subject_color, time, date, day, month, s3_title, email) => fetch('https://thejoury.com/autonotes/dynamodb.php?action=postPost&title=' + title + '&subject_id=' + subject_id + '&subject=' + subject+ '&subject_color=' + subject_color + '&time=' + time + '&date=' + date + '&day=' + day + '&month=' + month + '&s3_title=' + s3_title + '&email=' + email, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: "authorized"
        })
        .then((response) => {
              return
            });

const fetchRemoveClassFromDb = (email, reverse_index) => fetch('https://thejoury.com/autonotes/remove_class_dynamodb.php?index=' + reverse_index + '&email=' + email, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: "authorized"
        })
        .then((response) => {
              return
            });

const fetchAddSubjectToDb = (email, id, subject, color) => fetch('https://thejoury.com/autonotes/subjects.php?action=addSubject&email=' + email + '&id=' + id + '&subject=' + subject + '&color=' + color, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: "authorized"
        })
        .then((response) => {
              return
            });

const fetchRemoveSubjectFromDb = (email, reverse_index) => fetch('https://thejoury.com/autonotes/subjects.php?action=removeSubject&email=' + email + '&index=' + reverse_index, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: "authorized"
        })
        .then((response) => {
              return
            });



export async function addClassToDbFunction(title, subject_id, subject, subject_color, time, date, day, month, s3_title, email) {
  await fetchAddClassToDb(title, subject_id, subject, subject_color, time, date, day, month, s3_title, email)
  return
}

export async function removeClassFromDbFunction(email, reverse_index) {
  await fetchRemoveClassFromDb(email, reverse_index)
  return
}

export async function addSubjectToDbFunction(email, id, subject, color) {
  await fetchAddSubjectToDb(email, id, subject, color)
  return
}

export async function removeSubjectFromDbFunction(email, reverse_index) {
  await fetchRemoveSubjectFromDb(email, reverse_index)
  return
}
