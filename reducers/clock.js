const clockReducer = (state={} , action) => {

  switch (action.type) {
    case 'SET_CLOCK':
      console.log("in reducer")
      return {time: action.time}

    default:
      return state
    }
}

export default clockReducer