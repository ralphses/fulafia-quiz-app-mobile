import axios from 'axios';
import React, {Component} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  NativeModules,
  StyleSheet,
  ScrollView,
  Modal,
  Pressable,
  ActivityIndicator, // Import ActivityIndicator
} from 'react-native';
import Immersive from 'react-native-immersive';

const {ScreenPinModule} = NativeModules;

const QUIZ_DURATION = 100;
const WARNING_THRESHOLD = QUIZ_DURATION * 0.15;
const SUBMISSION_DELAY = 5;

class QuizScreen extends Component {
  constructor(props) {
    super(props);

    this.state = {
      currentQuestionIndex: 0,
      selectedOption: '',
      pinScreen: true,
      remainingTime: props.route.params.duration,
      isSubmitModalVisible: false,
      isTimeUpModalVisible: false,
      showWarning: false,
      questions: props.route.params.questions,
      duration: props.route.params.duration,
      matric: props.route.params.matric,
      examId: props.route.params.id,
      answers: [],
      submitData: null,
      isTimeWarningVisible: false,
      isSubmitting: false, // Add isSubmitting state
    };

    this.timerInterval = null;
  }

  showTimeWarningModal = show => {
    this.setState({isTimeWarningVisible: show});
  };

  componentDidMount() {
    ScreenPinModule.startScreenPin();
    Immersive.on();
    this.startCountdown();
  }

  componentDidUpdate(prevProps, prevState) {
    // Calculate 15% of the total duration
    const fifteenPercent = Math.floor(QUIZ_DURATION * 0.15);

    if (prevState.remainingTime <= fifteenPercent && !prevState.showWarning) {
      this.showTimeWarning();
      this.showTimeWarningModal(true); // Show the time warning modal
    }

    if (prevState.remainingTime <= 0 && !this.state.isTimeUpModalVisible) {
      // Trigger submission when time reaches 0
      this.handleConfirmSubmit();
      this.setState({isTimeUpModalVisible: true}, () => {
        setTimeout(() => {
          this.setState({isTimeUpModalVisible: false});
        }, SUBMISSION_DELAY * 1000);
      });
    }
  }

  componentWillUnmount() {
    ScreenPinModule.stopScreenPin();
    Immersive.off();
    clearInterval(this.timerInterval);
  }

  handlePreviousQuestion = () => {
    this.setState(prevState => ({
      currentQuestionIndex: prevState.currentQuestionIndex - 1,
      selectedOption: '',
    }));
  };

  startCountdown() {
    this.timerInterval = setInterval(() => {
      this.setState(
        prevState => {
          if (prevState.remainingTime > 0) {
            return {remainingTime: prevState.remainingTime - 1};
          }
          // Trigger submission when time reaches 0
          return null;
        },
        () => {
          if (this.state.remainingTime === 0) {
            this.handleConfirmSubmit();
          }
        },
      );
    }, 1000);
  }

  showTimeWarning() {
    this.setState({showWarning: true});
  }

  handleOptionSelect = (option, questionId) => {
    this.setState(prevState => {
      const {answers} = prevState;
      const updatedAnswers = [...answers];

      const answerIndex = updatedAnswers.findIndex(
        answer => answer.questionId === questionId,
      );

      if (answerIndex !== -1) {
        updatedAnswers[answerIndex].selectedOption = option;
      } else {
        updatedAnswers.push({questionId, selectedOption: option});
      }

      return {answers: updatedAnswers};
    });

    this.setState({selectedOption: option});
  };

  handleNextQuestion = () => {
    this.setState(prevState => ({
      currentQuestionIndex: prevState.currentQuestionIndex + 1,
      selectedOption: '',
    }));
  };

  handleOpenSubmitModal = () => {
    this.setState({isSubmitModalVisible: true});
  };

  handleCloseSubmitModal = () => {
    this.setState({isSubmitModalVisible: false});
  };

  checkOption(questionId, selectedOption) {
    const answersArray = this.state.answers;
    return answersArray.some(
      answer =>
        answer.questionId === questionId &&
        answer.selectedOption === selectedOption,
    );
  }

  handleConfirmSubmit = () => {
    this.setState({isSubmitting: true}); // Set isSubmitting to true

    this.setState(
      {
        submitData: {
          examId: this.state.examId,
          questions: this.state.answers,
        },
      },
      () => {
        const {submitData} = this.state;
        const headers = {
          'Content-Type': 'application/json',
        };

        axios
          .post(
            `http://localhost:8080/api/v1/exam/submit/${this.state.matric}`,
            submitData,
            {headers},
          )
          .then(response => {
            if (response.status === 200) {
              const {navigation} = this.props;
              if (navigation) {
                navigation.navigate('Home');
              }
            }
          })
          .catch(error => console.error(error.response.data))
          .finally(() => {
            this.setState({isSubmitting: false}); // Set isSubmitting to false after submission
          });
      },
    );
  };

  render() {
    const {
      currentQuestionIndex,
      remainingTime,
      isSubmitModalVisible,
      isTimeUpModalVisible,
      questions,
      isSubmitting, // Get the isSubmitting state
    } = this.state;
    const currentQuestion = questions[currentQuestionIndex];

    const showPreviousButton = currentQuestionIndex > 0;
    const showNextButton = currentQuestionIndex < questions.length - 1;

    return (
      <View style={styles.container}>
        <Text style={styles.timer}>Time Left: {remainingTime} seconds</Text>
        <ScrollView style={styles.scrollContainer}>
          <Text style={styles.question}>{currentQuestion.question}</Text>
          <TouchableOpacity
            style={[
              styles.option,
              this.checkOption(currentQuestion.id, 'A') &&
                styles.selectedOption,
            ]}
            onPress={() => this.handleOptionSelect('A', currentQuestion.id)}>
            <Text style={styles.optionText}>{currentQuestion.A}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.option,
              this.checkOption(currentQuestion.id, 'B') &&
                styles.selectedOption,
            ]}
            onPress={() => this.handleOptionSelect('B', currentQuestion.id)}>
            <Text style={styles.optionText}>{currentQuestion.B}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.option,
              this.checkOption(currentQuestion.id, 'C') &&
                styles.selectedOption,
            ]}
            onPress={() => this.handleOptionSelect('C', currentQuestion.id)}>
            <Text style={styles.optionText}>{currentQuestion.C}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.option,
              this.checkOption(currentQuestion.id, 'D') &&
                styles.selectedOption,
            ]}
            onPress={() => this.handleOptionSelect('D', currentQuestion.id)}>
            <Text style={styles.optionText}>{currentQuestion.D}</Text>
          </TouchableOpacity>
        </ScrollView>
        <View style={styles.buttonContainer}>
          {showPreviousButton && (
            <TouchableOpacity
              style={[styles.navigationButton, styles.previousButton]}
              onPress={this.handlePreviousQuestion}>
              <Text style={styles.navigationButtonText}>Previous</Text>
            </TouchableOpacity>
          )}
          {showNextButton && (
            <TouchableOpacity
              style={[styles.navigationButton, styles.nextButton]}
              onPress={this.handleNextQuestion}>
              <Text style={styles.navigationButtonText}>Next</Text>
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity
          style={styles.submitButton}
          onPress={this.handleOpenSubmitModal}
          disabled={isSubmitting} // Disable the button when submitting
        >
          {isSubmitting ? ( // Show loader when submitting
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.submitButtonText}>Submit</Text>
          )}
        </TouchableOpacity>

        {/* Submit Modal */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={isSubmitModalVisible}>
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Confirm Submission</Text>
              <Text style={styles.modalText}>
                Are you sure you want to submit the quiz?
              </Text>
              <View style={styles.modalButtonContainer}>
                <Pressable
                  style={[styles.modalButton, styles.modalCancel]}
                  onPress={this.handleCloseSubmitModal}>
                  <Text style={styles.modalButtonText}>Cancel</Text>
                </Pressable>
                <Pressable
                  style={[styles.modalButton, styles.modalConfirm]}
                  onPress={this.handleConfirmSubmit}>
                  <Text style={styles.modalButtonText}>Confirm</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>

        {/* Time's Up Modal */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={isTimeUpModalVisible}>
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Time's Up!</Text>
              <Text style={styles.modalText}>
                Your exam is being submitted.
              </Text>
            </View>
          </View>
        </Modal>

        {/* Time Warning Modal */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={this.state.isTimeWarningVisible}>
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Time Warning</Text>
              <Text style={styles.modalText}>
                You have 15% of your time remaining.
              </Text>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalConfirm]}
                onPress={() => this.showTimeWarningModal(false)}>
                <Text style={styles.modalButtonText}>OK</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F7F7',
    paddingHorizontal: 20,
  },
  timer: {
    marginTop: 20,
    fontSize: 18,
    textAlign: 'center',
  },
  scrollContainer: {
    flex: 1,
  },
  question: {
    fontSize: 22,
    fontWeight: 'bold',
    marginVertical: 20,
  },
  option: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 15,
    paddingHorizontal: 20,
    marginVertical: 10,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#EAEAEA',
  },
  selectedOption: {
    backgroundColor: '#bc6c25',
    borderColor: '#bc6c25',
  },
  optionText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  navigationButton: {
    flex: 1,
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 10,
    marginTop: 20,
    alignItems: 'center',
  },
  previousButton: {
    marginRight: 30,
    borderWidth: 3,
    borderColor: '#bc6c25',
    backgroundColor: 'white', // Previous button background color
  },
  nextButton: {
    borderWidth: 3,
    borderColor: '#bc6c25',
    backgroundColor: 'white', // Next button background color
  },
  navigationButtonText: {
    color: 'black',
    fontSize: 18,
    fontWeight: 'bold',
  },
  submitButton: {
    backgroundColor: '#606c38',
    paddingVertical: 15,
    borderRadius: 10,
    marginTop: 20,
    marginBottom: 20,
    alignItems: 'center',
  },
  submitButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  // Modal styles
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalText: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
  },
  modalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  modalButton: {
    borderRadius: 5,
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginHorizontal: 10,
  },
  modalCancel: {
    backgroundColor: 'red',
  },
  modalConfirm: {
    backgroundColor: '#606c38',
  },
  modalButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default QuizScreen;
