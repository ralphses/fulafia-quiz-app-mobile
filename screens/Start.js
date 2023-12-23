import React, { useState } from 'react'; // Import useState
import { View, Text, TouchableOpacity, Image, StyleSheet, ActivityIndicator } from 'react-native';

const StartScreen = ({ route, navigation }) => {
  const {
    courseTitle,
    courseCode,
    courseUnit,
    examDuration,
    studentName,
    matricNumber,
    questions,
    examId,
    currentSession,
  } = route.params;

  // Initialize the loading state
  const [loading, setLoading] = useState(false);

  const handleStartExam = () => {
    // Set loading to true when the button is clicked
    setLoading(true);

    // Simulate a delay to show the loader (you can replace this with your navigation logic)
    setTimeout(() => {
      navigation.navigate('Quiz', {
        questions: questions,
        duration: examDuration,
        matric: matricNumber,
        id: examId,
        course: courseCode,
      });
    }, 1000); // Replace this delay with your navigation logic

    // Note: The loading state should be set back to false when the exam starts.
    // You should add this logic within your navigation to the quiz screen.
  };

  return (
    <View style={styles.container}>
      <Image source={require('../assets/images/logo.png')} style={styles.studentPhoto} />

      <Text style={styles.courseTitle}>{courseTitle}</Text>
      <Text style={styles.courseInfo}>Course Code: {courseCode}</Text>
      <Text style={styles.courseInfo}>Course Unit: {courseUnit}</Text>
      <Text style={styles.courseInfo}>Exam Duration: {examDuration} seconds</Text>

      <Text style={styles.studentInfo}>Student Name: {studentName}</Text>
      <Text style={styles.studentInfo}>Matric Number: {matricNumber}</Text>
      <Text style={styles.studentInfo}>Current Session: {currentSession}</Text>

      {loading ? (
        // Conditional rendering of loader while loading is true
        <ActivityIndicator size="large" color="#606c38" />
      ) : (
        <TouchableOpacity style={styles.startButton} onPress={handleStartExam}>
          <Text style={styles.startButtonText}>Start Exam</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F7F7',
    paddingHorizontal: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  studentPhoto: {
    width: 150,
    height: 150,
    borderRadius: 75,
    marginBottom: 20,
  },
  courseTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  courseInfo: {
    fontSize: 18,
    marginBottom: 5,
  },
  studentInfo: {
    fontSize: 18,
    marginTop: 10,
  },
  startButton: {
    backgroundColor: '#606c38',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 10,
    marginTop: 20,
  },
  startButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default StartScreen;
