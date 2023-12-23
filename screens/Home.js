import React, { Component } from 'react';
import {
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import DeviceInfo from 'react-native-device-info';
import MessageModal from '../components/MessageModal';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';

class WelcomeScreen extends Component {
  constructor(props) {
    super(props);

    this.state = {
      passcode: '',
      matricNumber: '',
      showInvalidPasscodeModal: false,
      showInvalidMatricNumberModal: false,
      showChargePhoneModal: false,
      examData: null,
      errorMessage: '',
      responseData: null,
      responseStatus: null,
      loading: false,
      isInputsValid: false,
    };
  }

  handlePasscodeChange = (text) => {
    this.setState({ passcode: text }, () => this.validateInputs());
  };

  handleMatricNumberChange = (text) => {
    this.setState({ matricNumber: text }, () => this.validateInputs());
  };

  validateInputs = () => {
    const { passcode, matricNumber } = this.state;
    const isInputsValid = passcode.trim() !== '' && matricNumber.trim() !== '';
    this.setState({ isInputsValid });
  };

  componentDidMount() {}

  fetchExamData = async (passcode, matric) => {
    await axios
      .get(
        `http://localhost:8080/api/v1/exam/get?passcode=${passcode}&matric=${matric}`,
      )
      .then((response) => {
        this.setState({ responseData: response.data.data });
        this.setState({ responseStatus: response.status });
        this.setState({ examData: response.data.data });
      })
      .catch((error) => {
        this.setState({ errorMessage: error.response.data.message });
        this.setState({ responseStatus: error.response.status });
      });
  };

  handlePasscodeSubmit = async () => {
    const { navigation } = this.props;
    const { passcode, matricNumber } = this.state;

    this.setState({ loading: true });

    await this.fetchExamData(passcode, matricNumber);

    const { examData, responseStatus } = this.state;

    if (responseStatus === 200) {
      const batteryLevel = await DeviceInfo.getBatteryLevel();

      if (batteryLevel >= 0.3) {
        if (matricNumber.trim() !== '') {
          navigation.navigate('Start', {
            courseTitle: examData.course.title,
            courseCode: examData.course.code,
            courseUnit: examData.course.unit,
            examDuration: examData.duration,
            imageUrl: examData.student.image,
            matricNumber: examData.student.matric,
            studentName: examData.student.name,
            questions: examData.questions,
            examId: examData.id,
          });
          this.setState({ passcode: '', matricNumber: '' });
        } else {
          this.setState({ showInvalidMatricNumberModal: true });
        }
      } else {
        this.setState({ showChargePhoneModal: true });
      }
    } else {
      this.setState({ showInvalidPasscodeModal: true });
    }

    this.setState({ loading: false });
  };

  handleCloseInvalidPasscodeModal = () => {
    this.setState({ showInvalidPasscodeModal: false, passcode: '' });
  };

  handleCloseInvalidMatricNumberModal = () => {
    this.setState({ showInvalidMatricNumberModal: false });
  };

  handleCloseChargePhoneModal = () => {
    this.setState({ showChargePhoneModal: false });
  };

  render() {
    const {
      passcode,
      matricNumber,
      showInvalidPasscodeModal,
      showInvalidMatricNumberModal,
      showChargePhoneModal,
      loading,
      isInputsValid,
    } = this.state;

    return (
      <View style={styles.container}>
        <Image source={require('../assets/images/logo.png')} style={styles.logo} />
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Enter Matric Number..."
            placeholderTextColor="#606c38"
            onChangeText={this.handleMatricNumberChange}
            value={matricNumber}
          />
          <TextInput
            style={styles.input}
            placeholder="Enter Exam Passcode..."
            placeholderTextColor="#606c38"
            onChangeText={this.handlePasscodeChange}
            value={passcode}
          />

          {loading ? (
            <ActivityIndicator size="large" color="#283618" />
          ) : (
            <TouchableOpacity
              style={[styles.button, !isInputsValid && styles.disabledButton]}
              onPress={this.handlePasscodeSubmit}
              disabled={!isInputsValid}
            >
              <Text style={styles.buttonText}>Submit</Text>
            </TouchableOpacity>
          )}
        </View>

        <MessageModal
          visible={showInvalidPasscodeModal}
          message={this.state.errorMessage}
          onClose={this.handleCloseInvalidPasscodeModal}
        />

        <MessageModal
          visible={showInvalidMatricNumberModal}
          message={this.state.errorMessage}
          onClose={this.handleCloseInvalidMatricNumberModal}
        />

        <MessageModal
          visible={showChargePhoneModal}
          message="Please charge your phone battery to at least 50% before starting the exam."
          onClose={this.handleCloseChargePhoneModal}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fefae0',
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 20,
  },
  logo: {
    width: 140,
    height: 140,
    marginBottom: 40,
    padding: 20,
  },
  inputContainer: {
    alignItems: 'center',
    width: '70%',
  },
  input: {
    backgroundColor: 'white',
    width: '100%',
    height: 55,
    paddingHorizontal: 20,
    color: 'black',
    marginBottom: 20,
    borderRadius: 10,
    fontSize: 20,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#283618',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    width: '60%',
    height: 50,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 20,
    textAlign: 'center',
  },
  disabledButton: {
    backgroundColor: 'gray', // Change color for disabled button
  },
});

export default WelcomeScreen;
