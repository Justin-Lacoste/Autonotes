import * as React from 'react'
import { View, Text, TouchableOpacity, StyleSheet, Button, Animated, Dimensions, Modal, ScrollView, Image, TextInput } from 'react-native'
import { useState, useEffect, useRef } from 'react'
import { Audio } from 'expo-av';
//import * as Crypto from 'expo-crypto';
import { sendAudioFunction } from '../functions/s3.js'
import { addClassToDbFunction } from '../functions/dynamodb.js'
import { addSubjectAction, saveClasseAction, saveClasseContentAction, setClockAction } from '../actions/index.js'
import { useSelector, useDispatch } from 'react-redux'

const {height,width} = Dimensions.get("window")
const windowWidth = width
const windowHeight = height
/*
let recording = new Audio.Recording();

const RECORDING_OPTIONS_PRESET_HIGH_QUALITY: RecordingOptions = {
  isMeteringEnabled: true,
  android: {
    extension: '.m4a',
    outputFormat: RECORDING_OPTION_ANDROID_OUTPUT_FORMAT_MPEG_4,
    audioEncoder: RECORDING_OPTION_ANDROID_AUDIO_ENCODER_AAC,
    sampleRate: 44100,
    numberOfChannels: 2,
    bitRate: 128000,
  },
  ios: {
    extension: '.mp3',
    audioQuality: RECORDING_OPTION_IOS_AUDIO_QUALITY_MAX,
    sampleRate: 44100,
    numberOfChannels: 2,
    bitRate: 128000,
    linearPCMBitDepth: 16,
    linearPCMIsBigEndian: false,
    linearPCMIsFloat: false,
  },
};
*/
function RecordPage() {

	const dispatch = useDispatch()

	const [user, setUser] = useState(useSelector(state => state.authentification))

	const [clock, setClock] = useState(useSelector(state => state.clock).time)
	const [clockMinutes, setClockMinutes] = useState(Math.floor((useSelector(state => state.clock).time%3600)/60))
	const [clockSeconds, setClockSeconds] = useState(useSelector(state => state.clock).time%60)
	const [clockHours, setClockHours] = useState(Math.floor(useSelector(state => state.clock).time/3600))

	//const [subjectsReducer, setSubjectsReducer] = useState([{subject: "mathematics", color: "red"}, {subject: "english", color: "blue"}])

	const id = 1

	const [classes, setClasses] = useState(useSelector(state => state.classes))

	const [classesContent, setClassesContent] = useState(useSelector(state => state.classes_content))

	const colors = ['blue', 'red', 'green', 'yellow', 'purple', 'pink']

	const [subjects, setSubjects] = useState(useSelector(state => state.subjects))

	const displaceMainAnim = useRef(new Animated.Value(0)).current;

	const displaceClassChoiceAnim = useRef(new Animated.Value(2000)).current;

	const opacityClassAnim = useRef(new Animated.Value(0)).current;

	const [isInClass, setIsInClass] = useState(false)

	const [isInEndClass, setIsInEndClass] = useState(false)

	const [isInChooseClass, setIsInChooseClass] = useState(false)

	const selectSubjectWarningAnim = useRef(new Animated.Value(-100)).current;


	const [audioData, setAudioData] = useState()


	const [currentClassText, setCurrentClassText] = useState("Hello, today, we're going to learn nothing!")
	const [subjectIndex, setSubjectIndex] = useState()
	const [classTitle, setClassTitle] = useState("")
	const [s3ClassTitle, setS3ClassTitle] = useState("")

	const months = ["Jan", "Feb", "March", "April", "May", "June", "July", "Aug", "Sep", "Oct", "Nov", "Dec"]
	const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]

	const [timer, setTimer] = useState(0)
  	const [isActive, setIsActive] = useState(false)
  	const [isPaused, setIsPaused] = useState(false)
  	const increment = useRef(null)


  	const [isInAddSubject, setIsInAddSubject] = useState(false)
  	const [addSubjectValue, setAddSubjectValue] = useState()

  	const [isInAddHours, setIsInAddHours] = useState(false)


  	const [testUri, setTestUri] = useState()



  	const [recording, setRecording] = React.useState();



  	async function hashStuff(raw_data) {
  		/*const digest = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        raw_data
      	);
  		return digest*/
  	}


  	function file_get_contents(filename) {
	    fetch(filename).then((resp) => resp.text()).then(function(data) {
	        return data;
	    });
	}



	function startClass() {

		if (subjectIndex != undefined) {

			Animated.timing(displaceMainAnim, {
			    toValue: 2000,
			    duration: 500,
			    useNativeDriver: true
			}).start();

			Animated.timing(opacityClassAnim, {
			    toValue: 1,
			    duration: 10000,
			    useNativeDriver: true
			}).start();

			handleStart()

			setTimeout(() => {startClassTwo()}, 1000)

			recording ? stopRecording : startRecording
		}
		else {

		    Animated.timing(selectSubjectWarningAnim, {
		      toValue: 0,
		      duration: 300,
		      useNativeDriver: true
		    }).start();

		    setTimeout(() => {removeSubjectWarningFunction()}, 2000)
		}
	}

	function removeSubjectWarningFunction() {
		    Animated.timing(selectSubjectWarningAnim, {
		      toValue: -300,
		      duration: 300,
		      useNativeDriver: true
		    }).start();
	}

	function startClassTwo() {
		setIsInClass(true)
		startRecording()
	}

	async function saveClass() {
		//var class_id = (classes[0] != undefined) ? (classes[0].id + 1) : 1
		const d = new Date()
		var class_month = months[d.getMonth()]
		var class_day = days[d.getDay()]
		var class_date = d.getDate()
		var temp_class = [{id: s3ClassTitle, title: classTitle, subject_id: subjects[subjectIndex].id, subject: subjects[subjectIndex].subject, subject_color: subjects[subjectIndex].color, time: timer, date: class_date, day: class_day, month: class_month, s3_title: s3ClassTitle}, ...classes]
		var temp_class_content = [{id: s3ClassTitle, content: currentClassText}]
		await dispatch(saveClasseAction(temp_class))
		//await dispatch(saveClasseContentAction(temp_class_content))
		var new_time_on_clock = clock - timer
		await dispatch(setClockAction(new_time_on_clock))
		setClock(new_time_on_clock)

		await addClassToDbFunction(classTitle, subjects[subjectIndex].id, subjects[subjectIndex].subject, subjects[subjectIndex].color, timer, class_date, class_day, class_month, s3ClassTitle, user.email)

		setIsInEndClass(false)
		setClassTitle("")
		setS3ClassTitle("")
		
	}

	function endClass() {
		
		saveClass()

		setIsInClass(false)

		Animated.timing(displaceMainAnim, {
		    toValue: 0,
		    duration: 500,
		    useNativeDriver: true
		}).start();

		Animated.timing(opacityClassAnim, {
		    toValue: 0,
		    duration: 10000,
		    useNativeDriver: true
		}).start();

		handleReset()
		
	}

	function prepareToEndClass() {
		stopRecording()
		setIsInEndClass(true)

		handlePause()
	}

	function cancelEndingClass() {
		setIsInEndClass(false)

		handleResume()
	}

	function selectSubject(subject) {
		setSubjectIndex(subject)
		setIsInChooseClass(false)
	}

	function cancelAddingNewSubject() {
		setIsInAddSubject(false)
		setAddSubjectValue()
	}


	async function addSubject() {
		var color_index = subjects.length % colors.length
		var new_id = (subjects[0] != undefined) ? (subjects[0].id + 1) : 1
		let temp_subjects = [{id: new_id, subject: addSubjectValue, color: colors[color_index]}, ...subjects] //problème avec ...subjects quand c'est le 1er subjet
		await dispatch(addSubjectAction(temp_subjects))
		setIsInAddSubject(false)
		setSubjects(temp_subjects)
		selectSubject(0)
		setAddSubjectValue("")
	}


  const handleStart = () => {
    setIsActive(true)
    setIsPaused(true)
    increment.current = setInterval(() => {
      setTimer((timer) => timer + 1)
    }, 1000)
  }
  const handlePause = () => {
    clearInterval(increment.current)
    setIsPaused(false)
  }
  const handleResume = () => {
    setIsPaused(true)
    increment.current = setInterval(() => {
      setTimer((timer) => timer + 1)
    }, 1000)
  }
  const handleReset = () => {
    clearInterval(increment.current)
    setIsActive(false)
    setIsPaused(false)
    setTimer(0)
  }
  const formatTime = () => {
    const getSeconds = `0${(timer % 60)}`.slice(-2)
    const minutes = `${Math.floor(timer / 60)}`
    const getMinutes = `0${minutes % 60}`.slice(-2)
    const getHours = `0${Math.floor(timer / 3600)}`.slice(-2)
    return `${getHours} : ${getMinutes} : ${getSeconds}`
  }

    async function startRecording() {

        await Audio.requestPermissionsAsync();
            await Audio.setAudioModeAsync({
                allowsRecordingIOS: true,
                playsInSilentModeIOS: true,
            });
            console.log('Starting recording..');
            const recording = new Audio.Recording();

            const RECORDING_OPTIONS_PRESET_LOW_QUALITY: RecordingOptions = {
                android: {
                    extension: '.wav',
                    outputFormat: 2,//RECORDING_OPTION_ANDROID_OUTPUT_FORMAT_MPEG_4,
                    audioEncoder: 1,//RECORDING_OPTION_ANDROID_AUDIO_ENCODER_AMR_NB,
                    sampleRate: 44100,
                    numberOfChannels: 2,
                    bitRate: 128000,
                },
                ios: {
                    extension: '.wav',
                    audioQuality: 0,//RECORDING_OPTION_IOS_AUDIO_QUALITY_MIN,
                    sampleRate: 44100,
                    numberOfChannels: 2,
                    bitRate: 128000,
                    linearPCMBitDepth: 16,
                    linearPCMIsBigEndian: false,
                    linearPCMIsFloat: false,
                },
            };

            const { ios, android } = Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY
            await recording.prepareToRecordAsync( {
              android: android,
              ios: {
                ...ios,
                extension: '.mp4',
                outputFormat: Audio.RECORDING_OPTION_IOS_OUTPUT_FORMAT_MPEG4AAC
              }

            })
            await recording.startAsync();
            setRecording(recording);
	}

	async function stopRecording() {
		/*
	    console.log('Stopping recording..');
	    await recording.stopAndUnloadAsync();
	    const uri = recording.getURI(); 
	    console.log('Recording stopped and stored at', uri);
	    setTestUri(uri)
	    const temp_formData = new FormData();
	    const date = new Date()
	    const name = id + '-' + date.getTime()
	    temp_formData.append('audio', {
	    	uri: uri,
	    	name: name + '.pm3'
	    })
	    temp_formData.append('Content-Type', 'audio/mpeg')
		*/
	   // putObjectFunction('nametest', temp_formData)
	    console.log('Stopping recording..');
	    setRecording(undefined);
	    await recording.stopAndUnloadAsync();
	    const uri = recording.getURI(); 
	    console.log('Recording stopped and stored at', uri);


	    const d = new Date()
	    const time = d.getTime()
	    const title = time 
	    setS3ClassTitle(title)
	    const title_with_extension = title + '.mp4'

	    const formDataArticle = new FormData();

        formDataArticle.append('image', {
            uri: uri,
            name: title_with_extension,
            type: 'audio/aac'
        })
        formDataArticle.append('Content-Type', 'audio/aac')
        const s3_response = await sendAudioFunction(title_with_extension, formDataArticle, user.email.substring(0,3))

	}



	return(
		<View style={styles.container}>

			<Animated.View style={[styles.mainView, {transform: [{translateY: displaceMainAnim}]}]}>
				<View style={{flex: 1, flexDirection: 'column', justifyContent: 'space-around', marginBottom: 30}}>
					<View style={{flexDirection: 'column', justifyContent: 'center'}}>
						<View style={{flexDirection: 'row', justifyContent: 'center', marginBottom: 5}}>
							<TouchableOpacity style={{padding: 10, paddingRight: 15, paddingLeft: 15, borderRadius: 10, backgroundColor: '#E9E9E9', alignSelf: 'flex-start'}}>
								<Text style={{textAlign: 'center', fontSize: 18, fontWeight: 'bold'}}>{(clockHours > 9 ? "" + clockHours: "0" + clockHours) + " : " + (clockMinutes > 9 ? "" + clockMinutes: "0" + clockMinutes) + " : " + (clockSeconds > 9 ? "" + clockSeconds: "0" + clockSeconds)}</Text>
							</TouchableOpacity>
						</View>
						{/*
						<TouchableOpacity onPress={() => setIsInAddHours(true)}>
							<Text style={{textAlign: 'center', color: '#00C2FF'}}>+ Add time</Text>
						</TouchableOpacity>
						*/}
					</View>

					<View style={{flexDirection: 'row', justifyContent: 'center'}}>
						<TouchableOpacity style={styles.startCircle} onPress={() => {
							startClass()
						}}>
							<Text style={{textAlign: 'center', fontSize: 25, fontWeight: 'bold', color: 'white'}}>Start class</Text>
						</TouchableOpacity>
					</View>

					<View style={{flexDirection: 'row', justifyContent: 'center'}}>
						<TouchableOpacity onPress={() => setIsInChooseClass()} style={styles.selectClassButton}>
							<Text style={{fontSize: 20, alignSelf: 'center', marginRight: 10}}>
							{((subjectIndex != undefined)) ? subjects[subjectIndex].subject : "Select class"}
							{console.log(subjectIndex)}
							</Text>
							<Image style={{width: 28, height: 20, resizeMode: 'contain', alignSelf: 'center'}} source={require('./down_arrow.png')}/>
						</TouchableOpacity>
					</View>

				</View>
			</Animated.View>

			<Animated.View style={[styles.subjectsWarning, {transform: [{translateY: selectSubjectWarningAnim}]}]}>
				<Text style={{textAlign: 'center', fontWeight: 'bold', padding: 30, color: 'red', fontSize: 18}}>Select a class before starting</Text>
			</Animated.View>


			<Modal
	            animationType="slide"
	            transparent={true}
	            visible={isInChooseClass}
	        >
				<View style={styles.mainView}>

					<Text style={{textAlign: 'center', margin: 20, fontSize: 25, fontWeight: 'bold'}}>Choose your class</Text>

						<ScrollView style={{flex: 1, marginBottom: 30}}>
						{(subjects != undefined && subjects != null && subjects != "" && subjects[0] != undefined) ?
							subjects.map((subject, index) =>
								<TouchableOpacity style={styles.subjectRow} onPress={() => selectSubject(index)}>
									<View style={[styles.singleClassColor, {backgroundColor: subject.color}]}></View>
									<Text style={{fontSize: 20, padding: 5, alignSelf: 'center'}}>{subject.subject}</Text>
								</TouchableOpacity>
							)
						:
						<View></View>
						}
								<View style={styles.subjectRow}>
								{(!isInAddSubject) ?
									<TouchableOpacity onPress={() => setIsInAddSubject(true)} style={{flex: 1}}>
										<Text style={{textAlign: 'center', alignSelf: 'center', padding: 5, fontSize: 20, color: '#00C2FF'}}>+ Add</Text>
									</TouchableOpacity>
									:
									<View style={{flex: 1, flexDirection: 'row', justifyContent: 'space-between'}}>
										<TextInput
											placeholder="e.g.: geography"
										    value={addSubjectValue}
				                			style={styles.addNewSubjectTitle}
				                			onChangeText={text => setAddSubjectValue(text)}
				                			returnKeyType="done"
										/>
										<View style={{flexDirection: 'row'}}>
											<TouchableOpacity style={{alignSelf: 'center', marginLeft: 10}} onPress={() => addSubject()}>
												<Image style={{width: 30, height: 30, resizeMode: 'contain', alignSelf: 'center'}} source={require('./ok.png')}/>
											</TouchableOpacity>
											<TouchableOpacity onPress={() => cancelAddingNewSubject()} style={{alignSelf: 'center', marginLeft: 10}}>
												<Image style={{width: 30, height: 30, resizeMode: 'contain', alignSelf: 'center'}} source={require('./cancel.png')}/>
											</TouchableOpacity>
										</View>
									</View>
								}
								</View>
						</ScrollView>
				</View>
			</Modal>



			<Modal
	            animationType="fade"
	            transparent={true}
	            visible={isInClass}
	        >
				<View style={styles.classMainView}>

					<View style={styles.classTextView}>
						<Text style={{flex: 1, color: 'white'}}>Helloooo</Text>
					</View>

					<View style={styles.timePauseView}>
						<View style={[styles.bigClassButton, {marginRight: 10}]}>
							<Text style={styles.classButtonText}>{formatTime()}</Text>
						</View>
						<TouchableOpacity onPress={(isPaused) ? handlePause  : handleResume} style={[styles.bigClassButton, {marginLeft: 10}]}>
							<Text style={styles.classButtonText}>{(isPaused) ? "Pause" : "Resume"}</Text>
						</TouchableOpacity>
					</View>

					<TouchableOpacity onPress={() => prepareToEndClass()} style={styles.classButton}>
						<Text style={styles.classButtonText}>End class</Text>
					</TouchableOpacity>

				</View>

				<Modal
		            animationType="fade"
		            transparent={true}
		            visible={isInEndClass}
		        >
		        	<View style={{flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', flexDirection: 'column', justifyContent: 'center'}}>
						<View style={{flex: 1, flexDirection: 'row', justifyContent: 'center'}}>
		        			<View style={{flex: 1, alignSelf: 'center', padding: 20, borderRadius: 15, backgroundColor: 'white', margin: 15}}>					
										<View style={{flex: 0, flexDirection: 'column', justifyContent: 'space-between'}}>
											<TextInput
												placeholder="Title"
											    value={classTitle}
					                			style={styles.addNewClassTitle}
					                			onChangeText={text => setClassTitle(text)}
					                			returnKeyType="done"
											/>
											<View style={{flexDirection: 'row', marginTop: 20, marginBottom: 10}}>
												<TouchableOpacity onPress={() => cancelEndingClass()} style={{alignSelf: 'center', padding: 10, marginRight: 5, flex: 1, backgroundColor: 'red', borderRadius: 8}}>
													<Text style={{textAlign: 'center', color: 'white', fontWeight: 'bold', fontSize: 18}}>Cancel</Text>
												</TouchableOpacity>
												<TouchableOpacity onPress={() => endClass()} style={{alignSelf: 'center', padding: 10, marginLeft: 5, flex: 1, backgroundColor: 'blue', borderRadius: 8}}>
													<Text style={{textAlign: 'center', color: 'white', fontWeight: 'bold', fontSize: 18}}>Save</Text>
												</TouchableOpacity>
											</View>
										</View>
			        		</View>
			        	</View>
			        </View>
		        </Modal>
			</Modal>


			<Modal
	            animationType="fade"
	            transparent={true}
	            visible={isInAddHours}
	        >
	        	<View style={{flex: 1, backgroundColor: 'rgba(255,255,255,0.6)', flexDirection: 'column', justifyContent: 'center'}}>
					<View style={{flex: 1, flexDirection: 'row', justifyContent: 'center'}}>
	        			<View style={{flex: 1, alignSelf: 'center', padding: 25, borderRadius: 15, backgroundColor: '#0095C3', margin: 20}}>

	        				<Text style={{fontWeight: 'bold', textAlign: 'center', fontSize: 20, color: 'white'}}>One-time purchases</Text>

	        				<TouchableOpacity style={styles.purchaseRow}>
	        					<Text style={styles.purchaseTitle}>+ 350 minutes</Text>
	        					<Text style={styles.purchaseTitle}>$3.99</Text>
	        				</TouchableOpacity>
	        				<TouchableOpacity style={styles.purchaseRow}>
	        					<Text style={styles.purchaseTitle}>+ 850 minutes</Text>
	        					<Text style={styles.purchaseTitle}>$7.99</Text>
	        				</TouchableOpacity>
							<TouchableOpacity style={styles.purchaseRow}>
	        					<Text style={styles.purchaseTitle}>+ 1200 minutes</Text>
	        					<Text style={styles.purchaseTitle}>$10.99</Text>
	        				</TouchableOpacity>

	        				<Text style={{fontWeight: 'bold', textAlign: 'center', fontSize: 20, marginTop: 10, color: 'white'}}>Subscription</Text>
							<TouchableOpacity style={styles.purchaseRowDouble}>
	        					<Text style={[styles.purchaseTitle, {marginBottom: 5, textAlign: 'center'}]}>1000 hours/month</Text>
	        					<Text style={[styles.purchaseTitle, {textAlign: 'center'}]}>$8.99/month</Text>
	        				</TouchableOpacity>

	        				<View style={{flexDirection: 'row', justifyContent: 'center'}}>
		        				<TouchableOpacity style={styles.purchaseRowDone} onPress={() => setIsInAddHours(false)}>
		        					<Text style={[styles.purchaseTitle, {marginBottom: 5, textAlign: 'center'}]}>Done</Text>
		        				</TouchableOpacity>
		        			</View>

	        			</View>
	        		</View>
	        	</View>
	        </Modal>


		</View>
	)
}


const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#242954'//'#0095C3''#0038FF'
	},
	mainView: {
		flex: 1,
		marginTop: 50,
		backgroundColor: 'white',
		borderTopRightRadius: 20,
		borderTopLeftRadius: 20,
		shadowColor: "#000",
		shadowOffset: {
			width: 0,
			height: 8,
		},
		shadowOpacity: 0.46,
		shadowRadius: 11.14,

		elevation: 17,
			},


	startCircle: {
		width: 180,
		height: 180,
		borderRadius: 180,
		backgroundColor: '#00F2D5',
		//backgroundColor: '#00C2FF',
		flexDirection: 'column',
		justifyContent: 'center',
		shadowColor: "#000",
		shadowOffset: {
			width: 0,
			height: 9,
		},
		shadowOpacity: 0.48,
		shadowRadius: 11.95,
		elevation: 18,
	},

	subjectRow: {
		flexDirection: 'row',
		padding: 8,
		margin: 10,
		borderRadius: 10,
		backgroundColor: 'white',
		shadowColor: "#000",
		shadowOffset: {
			width: 0,
			height: 2,
		},
		shadowOpacity: 0.23,
		shadowRadius: 2.62,

		elevation: 4,
		},

	singleClassColor: {
		width: 20,
		height: 20,
		borderRadius: 20,
		marginRight: 20,
		flex: 0,
		alignSelf: 'center'
	},


	classMainView: {
		flex: 1,
		backgroundColor: '#002834',
		padding: 20,
		paddingTop: 35,
		flexDirection: 'column',

	},

	classTextView: {
		flex: 1,
		borderWidth: 3,
		borderColor: '#00C2FF',
		borderRadius: 5,
		padding: 10
	},

	timePauseView: {
		flexDirection: 'row',
	},

	classButton: {
		borderWidth: 3,
		borderColor: '#00C2FF',
		borderRadius: 5,
		padding: 8,
		flex: 0,
		marginTop: 10
	},

	bigClassButton: {
		borderWidth: 3,
		borderColor: '#00C2FF',
		borderRadius: 5,
		padding: 8,
		flex: 1,
		marginTop: 10
	},

	classButtonText: {
		fontWeight: 'bold',
		color: '#00C2FF',
		textAlign: 'center'
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
	},

	selectClassButton: {
		flexDirection: 'row',
		backgroundColor: '#EBEBEB',
		padding: 15,
		borderRadius: 30,
		paddingLeft: 30,
		paddingRight: 30,
		shadowColor: "#000",
		shadowOffset: {
			width: 0,
			height: 4,
		},
		shadowOpacity: 0.30,
		shadowRadius: 4.65,
		elevation: 8,
		backgroundColor: 'white'
		/*flexDirection: 'row',
		backgroundColor: '#EBEBEB',
		padding: 10,
		borderRadius: 10,
		paddingLeft: 15,
		paddingRight: 15*/
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

	addNewClassTitle: {
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

	purchaseRow: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		backgroundColor: '#00C2FF',
		marginTop: 10,
		marginBottom: 10,
		padding: 15,
		flex: 0,
		shadowColor: "#000",
		shadowOffset: {
			width: 0,
			height: 3,
		},
		shadowOpacity: 0.29,
		shadowRadius: 4.65,
		elevation: 7,
		borderRadius: 7,
		color: 'white'
	},
	purchaseTitle: {
		fontSize: 18,
		color: 'white',
		fontWeight: 'bold'
	},
	purchaseRowDouble: {
		flexDirection: 'column',
		justifyContent: 'space-between',
		backgroundColor: '#00C2FF',
		marginTop: 10,
		marginBottom: 10,
		padding: 15,
		flex: 0,
		shadowColor: "#000",
		shadowOffset: {
			width: 0,
			height: 3,
		},
		shadowOpacity: 0.29,
		shadowRadius: 4.65,
		elevation: 7,
		borderRadius: 7
	},
	purchaseRowDone: {
		flexDirection: 'column',
		alignSelf: 'flex-start',
		justifyContent: 'space-between',
		backgroundColor: '#00C2FF',
		marginTop: 10,
		marginBottom: 10,
		padding: 10,
		paddingLeft: 20,
		paddingRight: 20,
		flex: 0,
		shadowColor: "#000",
		shadowOffset: {
			width: 0,
			height: 3,
		},
		shadowOpacity: 0.29,
		shadowRadius: 4.65,
		elevation: 7,
		borderRadius: 7
	}

})


export default RecordPage;