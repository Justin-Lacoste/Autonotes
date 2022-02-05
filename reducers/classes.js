const classesReducer = (state={} , action) => {

  switch (action.type) {
    case 'SAVE_CLASS':
      //var temp_classes = [action.classe, ...state]
      return action.classe

    default:
      return state
    }
}

export default classesReducer