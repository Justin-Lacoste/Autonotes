const classesContentReducer = (state={} , action) => {

  switch (action.type) {
    case 'SAVE_CLASS_CONTENT':
      //var temp_classes = [action.classe, ...state]
      return action.classe

    default:
      return state
    }
}

export default classesContentReducer