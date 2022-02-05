const subjectsReducer = (state = {}, action) => {

  switch (action.type) {
    case 'ADD_SUBJECT':
      return action.subjects

    default:
      return state
    }
}

export default subjectsReducer