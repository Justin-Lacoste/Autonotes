export const addSubjectAction = (subjects) => {

  return {
    type: 'ADD_SUBJECT',
    subjects: subjects

  }
}


export const saveClasseAction = (classe) => {

  return {
    type: 'SAVE_CLASS',
    classe: classe

  }
}

export const saveClasseContentAction = (classe) => {

  return {
    type: 'SAVE_CLASS_CONTENT',
    classe: classe

  }
}


export const signUpAction = (user) => {

  return {
    type: 'SIGN_UP',
    user: user

  }
}

export const setClockAction = (time) => {
  console.log("in aciton")
  return {
    type: 'SET_CLOCK',
    time: time

  }
}
