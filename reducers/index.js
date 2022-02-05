import { combineReducers } from 'redux'

import subjectsReducer from './subjects.js'
import classesReducer from './classes.js'
import classesContentReducer from './classes_content.js'
import authentificationReducer from './authentification.js'
import clockReducer from './clock.js'


const allReducers = combineReducers({
  subjects: subjectsReducer,
  classes: classesReducer,
  classes_content: classesContentReducer,
  authentification: authentificationReducer,
  clock: clockReducer
})

export default allReducers