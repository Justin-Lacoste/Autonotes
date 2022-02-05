import React from 'react'
import { View, StyleSheet, Text, TouchableOpacity, ScrollView, Image, TextInput, Animated, Modal } from 'react-native'
import { signUpFunction } from '../functions/authentification.js'
import { Audio } from 'expo-av';
import { addSubjectAction, signUpAction, saveClasseAction } from '../actions/index.js'
import { getTranscriptionFunction, getPresignedUrlFunction } from '../functions/s3.js'
import { removeClassFromDbFunction } from '../functions/dynamodb.js'
import { useState, useEffect, useRef } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { LinearGradient } from 'expo-linear-gradient';


var triangle_border_width = 21

const dark_blue = "#242954"

function FilesPage() {

	const dispatch = useDispatch()

	const [user, setUser] = useState(useSelector(state => state.authentification))

	//const classes = [{title: "English lecture 1 after bla bla bla", date: "22 oct", lenght: 22, color: 'red'}, {title: "English lecture 2", date: "23 oct", lenght: 45, color: 'red'}]

	const [subjects, setSubjects] = useState(useSelector(state => state.subjects))

	const [classes, setClasses] = useState(useSelector(state => state.classes))

	const [classesContent, setClassesContent] = useState(useSelector(state => state.classes_content))

	const colors = ['blue', 'red', 'green', 'yellow', 'purple', 'pink']

	const [isInEdit, setIsInEdit] = useState(false)

	const [isInEditSubject, setIsInEditSubject] = useState(false)
	const [editSubjectIndex, setEditSubjectIndex] = useState()
	const [editSubjectValue, setEditSubjectValue] = useState()

	const [isInEditSubjectDeleteRelatedClasses, setIsInEditSubjectDeleteRelatedClasses] = useState(false)

	const deleteExpansionAnim = useRef(new Animated.Value(0)).current;

	const displaceRowAnim = useRef(new Animated.Value(30)).current;

	const [isInDeleteClass, setIsInDeleteClass] = useState(false)

	const [classToDelete, setClassToDelete] = useState('')
	const [classIndexToDelete, setClassIndexToDelete] = useState()

	const [isInClassNotes, setIsInClassNotes] = useState(false)

	const [isInAddSubject, setIsInAddSubject] = useState(false)
  	const [addSubjectValue, setAddSubjectValue] = useState()

  	const [isInProfile, setIsInProfile] = useState(false)

  	const [signUpEmail, setsignUpEmail] = useState()
  	const [signUpPassword, setSignUpPassword] = useState()



  	const [currentClass, setCurrentClass] = useState()
  	const [currentClassLength, setCurrentClassLength] = useState()
  	const [currentClassContent, setCurrentClassContent] = useState()
  	const [currentClassTranscription, setCurrentClassTranscription] = useState()
  	const [currentClassPresignedUrl, setCurrentClassPresignedUrl] = useState()

  	const [sound, setSound] = useState();
  	const [isPlayingSound, setIsPlayingSound] = useState(false);
  	const [isPausingSound, setIsPausingSound] = useState(false);


  	const [isInsearch, setIsInSearch] = useState(false)
  	const [hasSearched, setHasSearched] = useState(false)
  	const [stringToSearch, setStringToSearch] = useState();
  	const [arrayOfIndicesOfSearches, setArrayOfIndicesOfSearches] = useState()
  	const [arrayOfStringOfSearches, setArrayOfStringOfSearches] = useState()
	const selectSubjectWarningAnim = useRef(new Animated.Value(-100)).current;
	function openSearch() {
		setIsInSearch(true)
		Animated.timing(selectSubjectWarningAnim, {
	      toValue: 0,
	      duration: 300,
	      useNativeDriver: true
	    }).start();
	}
	function closeSearch() {
		setIsInSearch(false)
		Animated.timing(selectSubjectWarningAnim, {
		      toValue: -300,
		      duration: 300,
		      useNativeDriver: true
		}).start();
		setStringToSearch()
	}



  	const time_range = 1
  	const [timer, setTimer] = useState(0)
  	const [barTimer, setBarTimer] = useState(0)
  	const [barTimerIncrement, setBarTimerIncrement] = useState(0)
  	const [reverseTimer, setReverseTimer] = useState(0)
  	const [isActive, setIsActive] = useState(false)
  	const [isPaused, setIsPaused] = useState(false)
  	const increment = useRef(null)


	const setIsInEditFunction = () => {

		setIsInEdit(!isInEdit)
	    if (!isInEdit) {
		    Animated.timing(deleteExpansionAnim, {
		      toValue: 1,
		      duration: 300,
		      useNativeDriver: true
		    }).start();

		    Animated.timing(displaceRowAnim, {
		      toValue: 0,
		      duration: 300,
		      useNativeDriver: true
		    }).start();
		}
		else {
		    Animated.timing(deleteExpansionAnim, {
		      toValue: 0,
		      duration: 300,
		      useNativeDriver: true
		    }).start();

		    Animated.timing(displaceRowAnim, {
		      toValue: 30,
		      duration: 300,
		      useNativeDriver: true
		    }).start();
		}
	};

	function willDeleteClassFunction(index) {
		setIsInDeleteClass(true)

		setClassToDelete(classes[index].title)
		setClassIndexToDelete(index)
	}

	async function goToClassNotes(index) {
		setCurrentClass(index)
		setCurrentClassLength(classes[index].time)
		setReverseTimer(classes[index].time)
		setBarTimerIncrement(1/classes[index].time)
		console.log(classesContent)

		var temp_transcription = await getTranscriptionFunction(classes[index].s3_title+'.mp4.json')
		setCurrentClassTranscription(temp_transcription)
		var temp_presigned_url = await getPresignedUrlFunction(classes[index].s3_title+'.mp4')
		setCurrentClassPresignedUrl(temp_presigned_url.url)

		setIsInClassNotes(true)

	}

	function cancelAddingNewSubject() {
		setIsInAddSubject(false)
		setAddSubjectValue()
	}

	async function addSubject() {
		var color_index = subjects.length % colors.length
		var new_id = (subjects[0] != undefined) ? (subjects[0].id + 1) : 1
		let temp_subjects = [{id: new_id, subject: addSubjectValue, color: colors[color_index]}, ...subjects]
		await dispatch(addSubjectAction(temp_subjects))
		setIsInAddSubject(false)
		setSubjects(temp_subjects)
		setAddSubjectValue("")
	}

	function editSubject(index) {
		setEditSubjectIndex(index)
		setEditSubjectValue(subjects[index].subject)
		setIsInEditSubject(true)
	}

	async function saveEditSubject() {
		var temp_subjects = [...subjects]
		temp_subjects[editSubjectIndex] = {id: temp_subjects[editSubjectIndex].id, subject: editSubjectValue, color: temp_subjects[editSubjectIndex].color}
		await dispatch(addSubjectAction(temp_subjects))
		setIsInEditSubject(false)
		setSubjects(temp_subjects)

		//AMODIFIER LE NOM DU SUJET DES CLASSES INDIVIDUELS AVEC UN FOR LOOP
	}

	async function deleteClass() {
		
		var temp_classes = [...classes]
		temp_classes.splice(classIndexToDelete, 1)
		setClasses(temp_classes)
		setIsInDeleteClass(false)
		await dispatch(saveClasseAction(temp_classes))
		var index_inverse = temp_classes.length - classIndexToDelete
		await removeClassFromDbFunction(user.email, index_inverse)
	}

	async function deleteSubject() {
		//SAME QUE EN HAUT
		var temp_subjects = [...subjects]
		var temp_subject_id = temp_subjects[editSubjectIndex].id

		var hasClassesWithSubjectToBeDeleted = false
		for (var i=0; i<classes.length; i++) {
			if (classes[i].subject_id == temp_subject_id) {
				hasClassesWithSubjectToBeDeleted = true
				break
			}
		}

		if (hasClassesWithSubjectToBeDeleted) {
			setIsInEditSubject(false)
			setIsInEditSubjectDeleteRelatedClasses(true)
		}
		else {
			temp_subjects.splice(editSubjectIndex, 1)
			await dispatch(addSubjectAction(temp_subjects))
			setIsInEditSubject(false)
			setSubjects(temp_subjects)
		}
	}


	async function signUp() {
		const signup_response = await signUpFunction(signUpEmail, signUpPassword)

		if (signup_response.status == "200") {
			await dispatch(signUpAction({email: signUpEmail, token: signup_response.token}))
			setUser({email: signUpEmail, token: signup_response.token})

			setsignUpEmail()
			setSignUpPassword()
		}
	}




	 function getIndicesOf(searchStr, str, caseSensitive) {
	    var searchStrLen = searchStr.length;
	    if (searchStrLen == 0) {
	      return [];
	    }
	    var startIndex = 0,
	      index,
	      indices = [];
	    if (!caseSensitive) {
	      str = str.toLowerCase();
	      searchStr = searchStr.toLowerCase();
	    }
	    while ((index = str.indexOf(searchStr, startIndex)) > -1) {
	      indices.push(index);
	      startIndex = index + searchStrLen;
	    }
	    return indices;
	 }


	function filter() {
		if (stringToSearch == null || stringToSearch == undefined || stringToSearch == "") {
			setIsInSearch(false)
	   	}
	   	else {
	   		setHasSearched(true)

	   		var findArray = getIndicesOf(stringToSearch, currentClassTranscription.results.transcripts[0].transcript, false);
		    var findArray_length = findArray.length

		    var array_of_strings = []
		    var previous_array = 0


		    for (var i = 0; i<findArray_length+1; i++) {
		    	var current_findArray = findArray[i]
		    	var current_findArray_plus_length = findArray[i]+stringToSearch.length

		    	array_of_strings.push(currentClassTranscription.results.transcripts[0].transcript.substring(previous_array, current_findArray))
		    	array_of_strings.push(currentClassTranscription.results.transcripts[0].transcript.substring(current_findArray, current_findArray_plus_length))
		    	previous_array = current_findArray_plus_length
		    }

		    setArrayOfStringOfSearches(array_of_strings)
	   	}
  	}


	async function playSound() {
	    console.log('Loading Sound');

	    const { sound } = await Audio.Sound.createAsync(
	        { uri: currentClassPresignedUrl },
  			{ shouldPlay: true }
	    );
	    setSound(sound);
	   	setIsPlayingSound(true)
	    handleStart()
	    

	    console.log('Playing Sound');
	    await sound.playAsync();
	}

	function continuePlaySound() {
		setIsPausingSound(false)
		handleResume()
		setIsPlayingSound(true)
		sound.playAsync();
	}

	function pauseSound() {
		setIsPausingSound(true)
		setIsPlayingSound(false)
		handlePause()
		sound.pauseAsync()
	}

	  React.useEffect(() => {
	    return sound
	      ? () => {
	      	  handlePause()
	          console.log('Unloading Sound');
	          setIsPlayingSound(false)
	          sound.unloadAsync();
	          
	      }
	      : undefined;
	  }, [sound]);


	  function navigateToTimeInAudio(time) {
	  	var temp_time = time * 1000
	  	var round_time = Math.floor(time)
	  	setTimer(round_time)
	  	setBarTimer(round_time)
	  	sound.setPositionAsync(temp_time)

	  }


	  const handleStart = () => {
	    setIsActive(true)
	    setIsPaused(true)
	    increment.current = setInterval(() => {
		      setTimer((timer) => (timer < currentClassLength) ? timer + 1 : timer)
		      setBarTimer((barTimer) => (barTimer < currentClassLength) ? barTimer + barTimerIncrement : barTimer)
		      //setReverseTimer((timer) => timer - 1)
	    }, 1000)
	  }
	  const handlePause = () => {
	    clearInterval(increment.current)
	    setIsPaused(false)
	  }
	  const handleResume = () => {
	    setIsPaused(true)
	    increment.current = setInterval(() => {
	    	if (timer < reverseTimer) {
		      setTimer((timer) => (timer < currentClassLength) ? timer + 1 : timer)
		      setBarTimer((barTimer) => (barTimer < currentClassLength) ? barTimer + barTimerIncrement : barTimer)
		      //setReverseTimer((timer) => timer - 1)
		    }
	    }, 1000)
	  }
	  const handleReset = () => {
	    clearInterval(increment.current)
	    setIsActive(false)
	    setIsPaused(false)
	    setTimer(0)
	    setReverseTimer(currentClassLength)
	  }
	  const formatTime = () => {
	    const getSeconds = `0${(timer % 60)}`.slice(-2)
	    const minutes = `${Math.floor(timer / 60)}`
	    const getMinutes = `0${minutes % 60}`.slice(-2)
	    const getHours = `0${Math.floor(timer / 3600)}`.slice(-2)
	    return `${(getHours>0) ? getHours + ":" : ""} ${getMinutes}:${getSeconds}`
	  }
	  const formatReverseTime = () => {
	    const getSeconds = `0${(reverseTimer % 60)}`.slice(-2)
	    const minutes = `${Math.floor(reverseTimer / 60)}`
	    const getMinutes = `0${minutes % 60}`.slice(-2)
	    const getHours = `0${Math.floor(reverseTimer / 3600)}`.slice(-2)
	    return `${(getHours>0) ? getHours + ":" : ""} ${getMinutes}:${getSeconds}`
	  }



	return(

		<View style={styles.container}>

			<View style={styles.header}>
				<TouchableOpacity delayPressIn={0} onPress={() => setIsInProfile(true)}>
					<Image style={styles.profileImage} source={require('./profile.png')}/>
				</TouchableOpacity>
				<TouchableOpacity delayPressIn={0} style={styles.editView} onPress={() => setIsInEditFunction(!isInEdit)}>
					<Text style={styles.editText}>{(isInEdit) ? "Done" : "Edit"}</Text>
				</TouchableOpacity>
			</View>

			<ScrollView style={styles.subjectsScrollView} horizontal={true}>
				{(isInEdit) ?
					<TouchableOpacity style={styles.subjectView} onPress={() => setIsInAddSubject(true)}>
						<Animated.Text style={[{color: '#00C2FF', alignSelf: 'center'}, {transform: [{scaleX: deleteExpansionAnim}]}]}>+Add</Animated.Text>
					</TouchableOpacity>
					:
					<View></View>
				}
				{(subjects != undefined && subjects != null && subjects != "" && subjects[0] != undefined) ?
					subjects.map((subject, index) =>
					<TouchableOpacity onPress={() => (isInEdit) ? editSubject(index) : console.log("")} style={styles.subjectView}>
						<View style={[styles.subjectColorMarker, {backgroundColor: subject.color}]}>
						</View>
						<Text style={[styles.subjectText, {color: (isInEdit) ? '#00C2FF' : 'black'}]}>{subject.subject}</Text>
					</TouchableOpacity>
				)
				:
				console.log("noting")
				}
			</ScrollView>


			<ScrollView style={styles.filesScrollView}>
			{(classes != undefined && classes != null && classes != "" && classes[0] != undefined) ?
				classes.map((singleClass, index) =>
				<TouchableOpacity onPress={() => goToClassNotes(index)} style={{flex: 1}}>
					<View style={{flex: 1}}>
						{(index > 0) ?
							<View style={styles.singleClassSeperator}>
								<View style={styles.sideSignleClassSeperator}></View>
								<View style={styles.centerSignleClassSeperator}></View>
								<View style={styles.sideSignleClassSeperator}></View>
							</View>
							:
							<View></View>
						} 
					</View>
					<View style={styles.singleClassDiv}>

						<View style={[styles.singleClassColor, {backgroundColor: singleClass.subject_color}]}></View>
						<View style={styles.singleClassFirstInnerDiv}>
							{(isInEdit) ?
								<TextInput
								    placeholder=""
								    value={singleClass.title}
		                			maxLength={50}
		                			style={styles.singleClassTitleTextInput}
								/>
								:
								<Text style={styles.singleClassTitle}>{singleClass.title}</Text>
							}
							<View style={styles.singleClassSecondInnerDiv}>
								<Text style={styles.singleClassSubTitle}>{singleClass.time} min</Text>
								<Animated.Text style={[styles.singleClassSubTitle], {transform: [{translateX: displaceRowAnim}]}}>{singleClass.day}, {singleClass.month} {singleClass.date}</Animated.Text>
							</View>
						</View>
						<TouchableOpacity onPress={() => willDeleteClassFunction(index)} style={[styles.signleClassDeleteButton, {transform: [{scaleX: deleteExpansionAnim}, {scaleY: deleteExpansionAnim}]}]}>
							<View style={{backgroundColor: 'white', width: 15, height: 3, alignSelf: 'center'}}>
							</View>
						</TouchableOpacity>
					</View>
				</TouchableOpacity>
			)
			:
			<View></View>}
			</ScrollView>


			<Modal
	            animationType="slide"
	            transparent={false}
	            visible={isInClassNotes}
	        	style={{flex: 1}}
	        >
		        <View style={{flex: 1}}>


		        	<View style={{height: 20, backgroundColor: '#00C2FF'}}>
		        	</View>
		        	<View style={{backgroundColor: '#00C2FF', flexDirection: 'row', justifyContent: 'space-between', padding: 8}}>
		        		<TouchableOpacity onPress={() => setIsInClassNotes(false)} style={{alignSelf: 'center', flexDirection: 'row', flex: 1}}>
		        			<Image style={{width: 20, height: 20, resizeMode: 'contain', marginRight: 2}} source={require('./back.png')}/>
		        			<Text style={{color: 'white', fontSize: 17}}>Back</Text>
		        		</TouchableOpacity>
		        		<Text style={{color: 'white', alignSelf: 'center', fontSize: 18}}>{(currentClass != undefined) ? classes[currentClass].subject.subject : ""}</Text>
		        		<View style={{flexDirection: 'row', justifyContent: 'flex-end', flex: 1}}>
			        		<TouchableOpacity onPress={() => openSearch()} style={{marginLeft: 10, marginRight: 10}}>
			        			<Image style={{width: 30, height: 30, resizeMode: 'contain'}} source={require('./search.png')}/>
			        		</TouchableOpacity>
			        		<TouchableOpacity style={{alignSelf: 'center', marginLeft: 10, marginRight: 10}}>
			        			<Image style={{width: 30, height: 30, resizeMode: 'contain'}} source={require('./share.png')}/>
			        		</TouchableOpacity>
		        		</View>
		        	</View>

		        	<View>
		        		<Text style={{textAlign: 'center', marginTop: 10, fontSize: 20, marginLeft: 5, marginRight: 5}}>{(currentClass != undefined) ? classes[currentClass].title : ""}</Text>
		        	</View>

		        	<View style={{flex: 1,/* borderWidth: 3, borderRadius: 10, borderColor: '#00C2FF', */margin: 10, padding: 5}}>
		        	{(!isPlayingSound && !isPausingSound) ?
		        		((isInsearch) ?
			        	<View>
			        		<Text style={{fontSize: 20}}>{(arrayOfStringOfSearches != null) ?  arrayOfStringOfSearches.map((string, index) => <Text style={{backgroundColor: (index%2) ? 'yellow' : 'white ', fontSize: 20, margin: 0, padding: 0}}>{string}</Text>) : currentClassTranscription.results.transcripts[0].transcript}</Text>
			        	</View>
		        		:
		        		<TextInput
						    placeholder="Looks like your classnotes are empty"
						    value={(currentClassTranscription != undefined) ? currentClassTranscription.results.transcripts[0].transcript : ""}
                			multiline={true}
                			style={{fontSize: 20}}
						/> 
					)
					:
		        	
		        	<Text>{(currentClassTranscription != undefined) ? currentClassTranscription.results.items.map((item) => <Text onPress={() => navigateToTimeInAudio(item.start_time)} style={{color: (item.start_time >= timer && item.start_time < (timer + time_range)) ? '#000000' : "#666666"}}>{item.alternatives[0].content} </Text>) : ""}</Text>
		        	}
		        	</View>



		        	<TouchableOpacity onPress={(isPlayingSound) ? pauseSound : ((isPausingSound) ? continuePlaySound : playSound)} style={
		        		(!isPlayingSound && !isPausingSound) ? {backgroundColor: 'rgba(196, 196, 196, 0.38)', position: 'absolute', right: 10, bottom: 10, height: 70, width: 70, borderRadius: 50, flex: 1, justifyContent: 'center', flexDirection: 'row', alignItems: 'center'}
		        		:
		        		{backgroundColor: 'rgba(196, 196, 196, 0.38)', position: 'absolute', right: 10, left: 10, bottom: 10, height: 70, borderRadius: 50, flex: 1, justifyContent: 'flex-end', flexDirection: 'row', alignItems: 'center', paddingRight: 20, paddingLeft: 20}
		        	}>
		        		{(!isPlayingSound && !isPausingSound) ?
			        		<View style={{width: 0, height: 0, borderBottomWidth: triangle_border_width, borderBottomColor: 'transparent', borderTopWidth: triangle_border_width, borderTopColor: 'transparent', borderLeftWidth: (triangle_border_width*2*0.86), borderLeftColor: 'rgba(0, 294, 255, 0.54)', marginLeft: 7}}>
			        		</View>
		        		:
		        			<View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', flex: 1}}>
		        				<Text style={{fontSize: 17, padding: 10, fontSize: 12}}>{formatTime()}</Text>
		        				<LinearGradient colors={['black', 'white']}  start={{x: barTimer, y: 0}} end={{x: barTimer, y: 0}} style={{flex: 1, height: 2, borderRadius: 2}} />
		        				<Text style={{fontSize: 17, padding: 10, fontSize: 12}}>{formatReverseTime()}</Text>
		        				{!(isPausingSound) ?
				        			<View style={{flexDirection: 'row', justifyContent: 'center'}}>
						        		<View style={{backgroundColor: 'rgba(0, 294, 255, 0.54)', width: 10, height: 35, marginRight: 3}}>
						        		</View>
						        		<View style={{backgroundColor: 'rgba(0, 294, 255, 0.54)', width: 10, height: 35, marginLeft: 3}}>
						        		</View>
						        	</View>
						        	:
						        	<View style={{width: 0, height: 0, borderBottomWidth: triangle_border_width*0.7, borderBottomColor: 'transparent', borderTopWidth: triangle_border_width*0.7, borderTopColor: 'transparent', borderLeftWidth: (triangle_border_width*1.7*0.86), borderLeftColor: 'rgba(0, 294, 255, 0.54)', marginLeft: 7}}>
			        				</View>
					        	}
				        	</View>
			        	}
		        	</TouchableOpacity>
		        	{(isInsearch) ?
			        	<Animated.View style={[styles.subjectsWarning, {transform: [{translateY: selectSubjectWarningAnim}]}]}>
			        		<TextInput
												placeholder="Search..."
											    value={stringToSearch}
					                			style={styles.searchTextInput}
					                			onChangeText={text => setStringToSearch(text)}
					                			autoCapitalize="none"
					                			clearButtonMode={"always"}
					                			returnKeyType="go"
					                			autoFocus={false}
					                			onSubmitEditing={() => filter()}
							/>
							<TouchableOpacity style={styles.doneSearchButton} onPress={() => closeSearch()}>
								<Text style={{alignSelf: 'center', color: 'white', fontWeight: 'bold'}}>Done</Text>
							</TouchableOpacity>
			        	</Animated.View>
		        	:
		        		<View></View>
		        	}
		        </View>

	        </Modal>


			<Modal
	            animationType="fade"
	            transparent={true}
	            visible={isInDeleteClass}
	        	style={{flex: 1}}
	        >
	        	<View style={{flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', flexDirection: 'column', justifyContent: 'center'}}>
	        		<View style={{flex: 1, flexDirection: 'row', justifyContent: 'center'}}>
	        			<View style={{flex: 0, alignSelf: 'center', padding: 30, borderRadius: 15, backgroundColor: 'white', margin: 30}}>
	        				<Text style={{fontSize: 25, paddingBottom: 5}}>Are you sure you want to delete <Text style={{fontWeight: 'bold'}}>{classToDelete}</Text>?</Text>
	        				<View style={{flex: 0, flexDirection: 'row', justifyContent: 'space-between', paddingTop: 10}}>
	        					<TouchableOpacity onPress={() => setIsInDeleteClass(false)} style={{flex: 1, padding: 10, backgroundColor: '#DADADA', borderRadius: 10, marginRight: 10}}>
	        						<Text style={{fontSize: 18, fontWeight: 'bold', textAlign: 'center'}}>Cancel</Text>
	        					</TouchableOpacity>
	        					<TouchableOpacity style={{flex: 1, padding: 10, backgroundColor: 'red', borderRadius: 10}} onPress={() => deleteClass()}>
	        						<Text style={{fontSize: 18, fontWeight: 'bold', textAlign: 'center', color: 'white'}}>Delete</Text>
	        					</TouchableOpacity>
	        				</View>
	        			</View>
	        		</View>
	        	</View>
	        </Modal>

	        <Modal
	            animationType="fade"
	            transparent={true}
	            visible={isInAddSubject}
	        	style={{flex: 1}}
	        >
	        	<View style={{flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', flexDirection: 'column', justifyContent: 'center'}}>
					<View style={{flex: 1, flexDirection: 'row', justifyContent: 'center'}}>
	        			<View style={{flex: 1, alignSelf: 'center', padding: 20, borderRadius: 15, backgroundColor: 'white', margin: 15}}>
	        						<Text style={{textAlign: 'center', fontSize: 20, fontWeight: 'bold', marginBottom: 15}}>New class subject</Text>					
									<View style={{flex: 0, flexDirection: 'row', justifyContent: 'space-between',}}>
										<TextInput
											placeholder="e.g.: geography"
										    value={addSubjectValue}
				                			style={styles.addNewSubjectTitle}
				                			onChangeText={text => setAddSubjectValue(text)}
				                			returnKeyType="done"
										/>
										<View style={{flexDirection: 'row'}}>
											<TouchableOpacity onPress={() => addSubject()} style={{alignSelf: 'center', marginLeft: 10}}>
												<Image style={{width: 30, height: 30, resizeMode: 'contain', alignSelf: 'center'}} source={require('./ok.png')}/>
											</TouchableOpacity>
											<TouchableOpacity onPress={() => cancelAddingNewSubject()} style={{alignSelf: 'center', marginLeft: 10}}>
												<Image style={{width: 30, height: 30, resizeMode: 'contain', alignSelf: 'center'}} source={require('./cancel.png')}/>
											</TouchableOpacity>
										</View>
									</View>

		        		</View>
		        	</View>
		        </View>
	        </Modal>


	        <Modal
	            animationType="fade"
	            transparent={true}
	            visible={isInEditSubject}
	        	style={{flex: 1}}
	        >
	        	<View style={{flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', flexDirection: 'column', justifyContent: 'center'}}>
					<View style={{flex: 1, flexDirection: 'row', justifyContent: 'center'}}>
	        			<View style={{flex: 1, alignSelf: 'center', padding: 20, borderRadius: 15, backgroundColor: 'white', margin: 15}}>
	        						<Text style={{textAlign: 'center', fontSize: 20, fontWeight: 'bold', marginBottom: 15}}>New class subject</Text>					
									<View style={{flex: 0, flexDirection: 'column', justifyContent: 'space-between'}}>
										<TextInput
											placeholder="e.g.: geography"
										    value={editSubjectValue}
				                			style={styles.editSubjectInput}
				                			onChangeText={text => setEditSubjectValue(text)}
				                			returnKeyType="done"
										/>
										<View style={{flexDirection: 'row', marginTop: 20, marginBottom: 10}}>
											<TouchableOpacity onPress={() => deleteSubject()} style={{alignSelf: 'center', padding: 10, marginRight: 5, flex: 1, backgroundColor: 'red', borderRadius: 8}}>
												<Text style={{textAlign: 'center', color: 'white', fontWeight: 'bold', fontSize: 18}}>Delete</Text>
											</TouchableOpacity>
											<TouchableOpacity onPress={() => saveEditSubject()} style={{alignSelf: 'center', padding: 10, marginLeft: 5, flex: 1, backgroundColor: 'blue', borderRadius: 8}}>
												<Text style={{textAlign: 'center', color: 'white', fontWeight: 'bold', fontSize: 18}}>Save</Text>
											</TouchableOpacity>
										</View>
									</View>

		        		</View>
		        	</View>
		        </View>
	        </Modal>


	        <Modal
	            animationType="fade"
	            transparent={true}
	            visible={isInEditSubjectDeleteRelatedClasses}
	        	style={{flex: 1}}
	        >
	        	<View style={{flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', flexDirection: 'column', justifyContent: 'center'}}>
					<View style={{flex: 1, flexDirection: 'row', justifyContent: 'center'}}>
	        			<View style={{flex: 1, alignSelf: 'center', padding: 20, borderRadius: 15, backgroundColor: 'white', margin: 15}}>
	        						<Text style={{textAlign: 'center', fontSize: 20, marginBottom: 15}}>Would you like to delete all the notes associated with the class <Text style={{fontWeight: 'bold'}}>{(editSubjectIndex != undefined) ? subjects[editSubjectIndex].subject : ""}</Text>?</Text>					
									<View style={{flex: 0, flexDirection: 'column', justifyContent: 'space-between'}}>
										<View style={{flexDirection: 'column', marginTop: 20, marginBottom: 10}}>
											<TouchableOpacity onPress={() => deleteSubject()} style={{padding: 10, marginRight: 5, flex: 0, backgroundColor: '#00C2FF', borderRadius: 8}}>
												<Text style={{textAlign: 'center', color: 'white', fontWeight: 'bold', fontSize: 18}}>Delete subject only</Text>
											</TouchableOpacity>
											<TouchableOpacity onPress={() => saveEditSubject()} style={{padding: 10, marginLeft: 5, flex: 0, backgroundColor: 'red', borderRadius: 8, marginTop: 15}}>
												<Text style={{textAlign: 'center', color: 'white', fontWeight: 'bold', fontSize: 18}}>Delete all classes</Text>
											</TouchableOpacity>
											<TouchableOpacity onPress={() => saveEditSubject()} style={{padding: 10, marginLeft: 5, flex: 0, backgroundColor: '#E5E5E5', borderRadius: 8, marginTop: 15}}>
												<Text style={{textAlign: 'center', color: 'black', fontWeight: 'bold', fontSize: 18}}>Cancel</Text>
											</TouchableOpacity>
										</View>
									</View>
		        		</View>
		        	</View>
		        </View>
	        </Modal>



	        <Modal
	            animationType="slide"
	            transparent={false}
	            visible={isInProfile}
	        	style={{flex: 1}}
	        >
	        	<View style={{backgroundColor: '#00C2FF', flexDirection: 'row', justifyContent: 'space-between', padding: 12, paddingTop: 20}}>
	        		<TouchableOpacity onPress={() => setIsInProfile(false)} style={{alignSelf: 'center', flexDirection: 'row', flex: 1, justifyContent: 'flex-start'}}>
	        			<Image style={{width: 20, height: 20, resizeMode: 'contain', marginRight: 2,}} source={require('./back.png')}/>
	        			<Text style={{color: 'white', fontSize: 18}}>Back</Text>
	        		</TouchableOpacity>
	        	</View>


	        	<View style={{backgroundColor: 'white'}}>
	        		<Image style={styles.profileImageProfile} source={require('./profile.png')}/>
	        	</View>

	        	{(user.email != undefined && user.email != null) ?

	        		<TouchableOpacity>
	        			<Text>Logout</Text>
	        		</TouchableOpacity>
	        		:
		        	<View>
			        	<TextInput
							placeholder="Enter an email"
							value={signUpEmail}
							onChangeText={text => setsignUpEmail(text)}
				            maxLength={30}
				            style={styles.singleClassTitleTextInput}
						/>
						<TextInput
							placeholder="Create a password"
							value={signUpPassword}
							onChangeText={text => setSignUpPassword(text)}
				            maxLength={20}
				            style={styles.singleClassTitleTextInput}
						/>

						<TouchableOpacity style={{flex: 0}} onPress={() => signUp()}>
							<Text style={{textAlign: 'center'}}>Create account</Text>
						</TouchableOpacity>
					</View>
				}

	        	<Text style={{textAlign: 'center', fontSize: 18}}>Purchase history</Text>
	        	<ScrollView style={{flexDirection: 'column', flex: 1, margin: 20, backgroundColor: '#F2F2F2', padding: 10, borderRadius: 10}}>
	        		<Text style={{textAlign: 'center'}}>No purchases</Text>
	        	</ScrollView>

	        </Modal>

		</View>

	)
}




const styles = StyleSheet.create({
	container: {
		flex: 1
	},


	header: {
		flex: 0,
		paddingTop: 20,
		flexDirection: 'row',
		justifyContent: 'space-between',
		borderBottomColor: '#CFCFCF',
		borderBottomWidth: 3,
	},

	profileImage: {
		width: 40,
		height: 40,
		opacity: 1,
		alignSelf: 'center',
		margin: 10
	},
	editView: {
		margin: 10,
		alignSelf: 'center'
	},
	editText: {
		fontSize: 18,
		color: '#00C2FF'
	},

	editSubjectInput: {
		flex: 0,
		fontSize: 20,
		marginTop: 4,
		marginBottom: 4,
		borderColor: '#BDBDBD',
		borderWidth: 1,
		padding: 5,
		borderRadius: 4,
		backgroundColor: '#EBEBEB',
	},


	subjectsScrollView: {
		flex: 0, 
		height: 35,
		maxHeight: 35,
		borderBottomColor: '#CFCFCF',
		borderBottomWidth: 3
	},
	subjectView: {
		paddingTop: 5,
		paddingBottom: 5,
		paddingLeft: 10,
		paddingRight: 10,
		height: 30,
		flexDirection: 'row',
		alignSelf: 'center'
	},
	subjectColorMarker: {
		width: 20,
		height: 20,
		borderRadius: 20,
		marginRight: 5
	},
	subjectText: {
		alignSelf: 'center'
	},



	filesScrollView: {
		flex: 1,
		backgroundColor: '#EBEBEB',
	},

	singleClassDiv: {
		flex: 1,
		backgroundColor: 'white',
		paddingTop: 15,
		paddingBottom: 15,
		paddingLeft: 15,
		paddingRight: 15,
		flexDirection: 'row',
		justifyContent: 'space-between'
	},
	singleClassTitle: {
		fontSize: 20,
		marginTop: 5,
		marginBottom: 5
	},
	singleClassTitleTextInput: {
		fontSize: 20,
		marginTop: 4,
		marginBottom: 4,
		borderColor: '#BDBDBD',
		borderWidth: 1,
		paddingTop: 1,
		paddingBottom: 1,
		paddingLeft: 3,
		borderRadius: 4,
		backgroundColor: '#EBEBEB'
	},
	singleClassTextInput: {
		fontSize: 20,
		marginTop: 4,
		marginBottom: 4,
		borderColor: '#BDBDBD',
		borderWidth: 1,
		paddingTop: 1,
		paddingBottom: 1,
		paddingLeft: 3,
		borderRadius: 4,
		backgroundColor: '#EBEBEB'
	},
	singleClassSubTitle: {
		color: '#646464'
	},
	singleClassSeperator: {
	    flex: 1,
	    /*backgroundColor: '#CFCFCF',
	    paddingLeft: 40,
	    paddingRight: 40*/
	    flexDirection: 'row'
	},
	sideSignleClassSeperator: {
		backgroundColor: 'white',
		height: 2,
		flex: 0.1
	},
	centerSignleClassSeperator: {
		backgroundColor: '#CFCFCF',
		height: 2,
		flex: 0.8,
		borderRadius: 4
	},
	singleClassColor: {
		width: 20,
		height: 20,
		borderRadius: 20,
		marginRight: 20,
		flex: 0, alignSelf: 'center'
	},
	singleClassFirstInnerDiv: {
		flex: 1,
		flexDirection: 'column',
		justifyContent: 'space-between'
	},
	singleClassSecondInnerDiv: {
		flex: 1,
		flexDirection: 'row',
		justifyContent: 'space-between',
		marginTop: 5,
		marginBottom: 5
	},

	signleClassDeleteButton: {
		backgroundColor: 'red',
		alignSelf: 'center',
		height: 30,
		width: 30,
		borderRadius: 50,
		flexDirection: 'column',
		justifyContent: 'center',
		marginLeft: 20
	},

	addNewSubjectTitle: {
		flex: 1,
		fontSize: 20,
		marginTop: 4,
		marginBottom: 4,
		borderColor: '#BDBDBD',
		borderWidth: 1,
		padding: 5,
		borderRadius: 4,
		backgroundColor: '#EBEBEB',
	},

	profileImageProfile: {
		width: 60,
		height: 60,
		opacity: 1,
		alignSelf: 'center',
		margin: 10
	},


	subjectsWarning: {
		position: 'absolute',
		top: 0,
		right: 0,
		left: 0,
		backgroundColor: '#F2F2F2',
		borderBottomRightRadius: 15,
		borderBottomLeftRadius: 15,
		//borderWidth: 1,
		borderColor: 'black',
		shadowColor: "#000",
		shadowOffset: {
			width: 0,
			height: 6,
		},
		shadowOpacity: 0.37,
		shadowRadius: 7.49,

		elevation: 12,
		flexDirection: 'row',
		paddingBottom: 10
	},

	doneSearchButton: {
		flex: 0,
		fontSize: 20,
		marginTop: 25,
		marginLeft: 5,
		marginBottom: 4,
		marginRight: 10,
		padding: 5,
		borderRadius: 4,
		backgroundColor: '#00C2FF',
		alignItems: 'center',
		flexDirection: 'column',
		justifyContent: 'center'
	},


	searchTextInput: {
		flex: 1,
		fontSize: 20,
		marginTop: 25,
		marginLeft: 10,
		marginRight: 5,
		marginBottom: 4,
		borderColor: '#BDBDBD',
		borderWidth: 1,
		padding: 5,
		borderRadius: 4,
		backgroundColor: '#EBEBEB',
	},
})

export default FilesPage;