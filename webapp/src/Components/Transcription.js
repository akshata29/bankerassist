import logo from '../mlogo.svg';
import React, { useEffect, useState, useRef, useCallback } from 'react';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Stack from 'react-bootstrap/Stack';
import Card from 'react-bootstrap/Card';
import { AudioConfig, SpeechConfig, SpeechRecognizer } from 'microsoft-cognitiveservices-speech-sdk';
import axios from 'axios';
import ChatAssist from './ChatAssist'; // Import the ChatAssist component

const API_KEY = process.env.REACT_APP_COG_SERVICE_KEY;
const API_LOCATION = process.env.REACT_APP_COG_SERVICE_LOCATION;
const AZURE_OPENAI_ENDPOINT = process.env.REACT_APP_AZURE_OPENAI_ENDPOINT;
const AZURE_OPENAI_KEY = process.env.REACT_APP_AZURE_OPENAI_KEY;
const AZURE_TEXT_ANALYTICS_KEY = process.env.REACT_APP_AZURE_TEXT_ANALYTICS_KEY;
const AZURE_TEXT_ANALYTICS_ENDPOINT = process.env.REACT_APP_AZURE_TEXT_ANALYTICS_ENDPOINT;
const AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT = process.env.REACT_APP_AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT;
const AZURE_DOCUMENT_INTELLIGENCE_KEY = process.env.REACT_APP_AZURE_DOCUMENT_INTELLIGENCE_KEY;
const AZURE_OPENAI_MODEL = process.env.REACT_APP_AZURE_OPENAI_MODEL;
const AZURE_OPENAI_VERSION = process.env.REACT_APP_AZURE_OPENAI_VERSION;

const STT_URL = "https://azure.microsoft.com/en-us/products/cognitive-services/speech-to-text/";
const sdk = require("microsoft-cognitiveservices-speech-sdk");
const speechConfig = SpeechConfig.fromSubscription(API_KEY, API_LOCATION);

let recognizer;

function Transcription() {
  const [recognisedText, setRecognisedText] = useState("");
  const [recognisingText, setRecognisingText] = useState("");
  const [isRecognising, setIsRecognising] = useState(false);
  const textRef = useRef();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [dob, setDob] = useState("");
  const [ssn, setSsn] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [emailAddress, setEmailAddress] = useState("");
  const [occupationTitle, setOccupationTitle] = useState("");
  const [occupationType, setOccupationType] = useState("");
  const [annualIncome, setAnnualIncome] = useState("");
  const [housingStatus, setHousingStatus] = useState("");
  const [maritalStatus, setMaritalStatus] = useState("");
  const [citizenship, setCitizenship] = useState("");
  const [accountType, setAccountType] = useState("");
  const [accountPurpose, setAccountPurpose] = useState("");
  const [initialDepositAmount, setInitialDepositAmount] = useState("");
  const [accountOpeningDate, setAccountOpeningDate] = useState("");
  const [branchLocation, setBranchLocation] = useState("");
  const [licenseNumber, setLicenseNumber] = useState("");
  const [dlExpiryDate, setDlExpiryDate] = useState("");
  const [dlIssueDate, setDlIssueDate] = useState("");
  const [dlIssueState, setDlIssueState] = useState("");
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [country, setCountry] = useState("");
  const [recommendation, setRecommendation] = useState('');
  const [initialPendingTask, setInitialPendingTask] = useState('');
  const [dlDetails, setDlDetails] = useState({});

  const [clientDataModel, setClientDataModel] = useState({
    client: {
      personal_information: {
        first_name: null,
        last_name: null,
        date_of_birth: null,
        ssn: null,
        phone_number: null,
        email_address: null,
        occupation: {
          title: null,
          type: null
        },
        annual_income: null,
        housing_status: {
          own_or_rent: null,
          marital_status: null
        },
        citizenship_status: {
          citizenship: null
        }
      },
      account_details: {
        account_type: null,
        account_purpose: null,
        initial_deposit_amount: null,
        account_opening_date: null,
        branch_location: null
      },
      address: {
        street: null,
        city: null,
        state: null,
        zip_code: null
      },
      identification: {
        driving_license: {
          license_number: null,
          expiry_date: null,
          issue_date: null,
          issue_state: null
        }
      }
    }
  });

  const [pendingTasks, setPendingTasks] = useState([
    "Customer First Name",
    "Customer Last Name",
    "Account Type",
    "Account Purpose",
    "Initial Deposit Amount",
    "Account Opening Date",
    "Branch Location",
    "Driving License",
    "DL Expiry Date",
    "DL Issue State",
    "Street",
    "City",
    "State",
    "ZIP Code",
    "DL Issue Date",
    "Date of Birth",
    "SSN",
    "Phone Number",
    "Email Address",
    "Occupation",
    "Occupation Type",
    "Annual Income",
    "Own or Rent House",
    "Marital Status",
    "Citizenship"
  ]);

  //console.log("Component rendered. Current recognisedText:", recognisedText);
  const [selectedFile, setSelectedFile] = useState(null);
  const [licenseDetails, setLicenseDetails] = useState(null);

   // Function to poll for result until analysis is complete
   const pollForResult = async (operationLocation) => {
    const POLL_INTERVAL = 2000; // Poll every 2 seconds
    let isComplete = false;
    let result = null;

    while (!isComplete) {
      const pollResponse = await axios.get(operationLocation, {
        headers: {
          "Ocp-Apim-Subscription-Key": AZURE_DOCUMENT_INTELLIGENCE_KEY
        }
      });

      // Check if the analysis is complete
      if (pollResponse.data.status === "succeeded") {
        isComplete = true;
        result = pollResponse.data;
      } else if (pollResponse.data.status === "failed") {
        throw new Error("Document analysis failed.");
      } else {
        // Wait for the specified interval before polling again
        await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL));
      }
    }

    return result;
  };

  // Function to handle file selection
  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const analyzeDrivingLicense = async () => {
    if (!selectedFile) {
      alert("Please upload a driving license image first.");
      return;
    }

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const response = await axios.post(
        `${AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT}/formrecognizer/documentModels/prebuilt-idDocument:analyze?api-version=2023-07-31`,
        selectedFile,
        {
          headers: {
            "Content-Type": "application/octet-stream",
            "Ocp-Apim-Subscription-Key": AZURE_DOCUMENT_INTELLIGENCE_KEY
          }
        }
      );

      // Get the operation location URL for polling
      const operationLocation = response.headers['operation-location'];

      // Poll the operation location URL until processing is complete
      const result = await pollForResult(operationLocation);
      
      // Extract specific details from the result
      const extractedData = {
        licenseNumber: result.analyzeResult.documents[0].fields?.DocumentNumber?.content || "N/A",
        expiryDate: result.analyzeResult.documents[0].fields?.DateOfExpiration?.content || "N/A",
        issueDate: result.analyzeResult.documents[0].fields?.DateOfIssue?.content || "N/A",
        issueState: result.analyzeResult.documents[0].fields?.Region?.content || "N/A",
        firstName: result.analyzeResult.documents[0].fields?.FirstName?.content || "N/A",
        lastName: result.analyzeResult.documents[0].fields?.LastName?.content || "N/A",
        address: result.analyzeResult.documents[0].fields?.Address?.content || "N/A",
      };

      setLicenseDetails(extractedData);

    } catch (error) {
      console.error("Error analyzing driving license:", error);
      alert("Failed to analyze the driving license. Please try again.");
    }
  };

  const generateRecommendation = useCallback(async () => {
    const prompt = `
      Act as a financial advisor. I have collected detailed information about a customer’s profile during a conversation, including their basic personal details, purpose for the account, selected account options, and verified ID. Your task is to analyze this information and recommend suitable products that could enhance the customer’s financial wellbeing or meet their specific needs. Provide these recommendations in a way that is informative and aligned with the customer’s potential benefits, without pushing unnecessary products.
  
      Here’s the information we have on the customer:
  
      ${recognisedText}
  
      Based on this information, suggest financial products or services that would provide tangible value to the customer, such as investment accounts, credit options, insurance products, or savings plans, along with brief explanations of why each product could benefit them.
    `;
  
    try {
      const response = await axios.post(
        `${AZURE_OPENAI_ENDPOINT}/openai/deployments/${AZURE_OPENAI_MODEL}/chat/completions?api-version=${AZURE_OPENAI_VERSION}`,
        {
          messages: [{ role: "user", content: prompt }],
          temperature: 0,
          max_tokens: 1500
        },
        {
          headers: {
            "Authorization": `Bearer ${AZURE_OPENAI_KEY}`,
            "Content-Type": "application/json",
            'api-key': AZURE_OPENAI_KEY
          }
        }
      );
  
      // Extract the recommendation from the response
      const recommendation = response.data.choices[0].message.content.trim();
      return `Recommendation:\n${recommendation}`;
    } catch (error) {
      console.error("Error generating recommendation:", error);
      return `Error generating recommendation: ${error.message}`;
    }
  }, [recognisedText]);

  
  const analyzeGuidance = useCallback(async () => {

    const prompt = `
      ROLE: You are an AI assistant analyzing a conversation transcript to identify addressed and unaddressed questions.
      TASK: For each question below, check if it has been answered based on the transcript. If answered, provide the answer. If not, leave it in the list of pending questions.
      QUESTIONS:
      ${pendingTasks.join("\n")}
      
      TRANSCRIPT:
      ${recognisedText}
      
      Format the response as follows:
      Addressed Questions:
      Question - Answer
      Unaddressed Questions:
      Question
    `;

    try {
      const response = await axios.post(
        `${AZURE_OPENAI_ENDPOINT}/openai/deployments/${AZURE_OPENAI_MODEL}/chat/completions?api-version=${AZURE_OPENAI_VERSION}`,
        {
          messages: [{ role: "user", content: prompt }],
          temperature: 0.2,
          max_tokens: 1500
        },
        {
          headers: {
            "Authorization": `Bearer ${AZURE_OPENAI_KEY}`,
            "Content-Type": "application/json",
            'api-key': AZURE_OPENAI_KEY
          }
        }
      );

      const completionText = response.data.choices[0].message.content;
      parseGuidanceResponse(completionText);
    } catch (error) {
      console.error("Error in guidance analysis:", error);
    }
  }, [recognisedText]);

  const parseGuidanceResponse = (completionText) => {
    const addressedQuestions = [];
    const unaddressedQuestions = [];

    let addressedSection = false;
    completionText.split("\n").forEach((line) => {
      if (line.includes("Addressed Questions:")) {
        addressedSection = true;
      } else if (line.includes("Unaddressed Questions:")) {
        addressedSection = false;
      } else if (addressedSection && line) {
        // Check if line is not None
        if (line != null) {
          const [question, answer] = line.split(" - ");
          if (question && answer)
            addressedQuestions.push({ question: question.trim(), answer: answer.trim() });
        }
      } else if (!addressedSection && line) {
        unaddressedQuestions.push(line.trim());
      }
    });

    updateClientDataModel(addressedQuestions);
    setPendingTasks(unaddressedQuestions);
  };

  const toggleListener = () => {
    if (!isRecognising) {
      startRecognizer();
      setRecognisedText("");
    } else {
      stopRecognizer();
    }
  };

  const updateClientDataModel = (addressedQuestions) => {
    const updatedModel = { ...clientDataModel };

    addressedQuestions.forEach(({ question, answer }) => {
      console.log("Question:", question, "Answer:", answer); // Debugging log
      switch (question.replace(/^[-]/, "").trim()) {
        case "Customer First Name":
          updatedModel.client.personal_information.first_name = answer;
          setFirstName(answer);
          break;
        case "Customer Last Name":
          updatedModel.client.personal_information.last_name = answer;
          setLastName(answer);
          break;
        case "Account Type":
          updatedModel.client.account_details.account_type = answer;
          setAccountType(answer);
          break;
        case "Account Purpose":
          updatedModel.client.account_details.account_purpose = answer;
          setAccountPurpose(answer);
          break;
        case "Initial Deposit Amount":
          updatedModel.client.account_details.initial_deposit_amount = answer;
          setInitialDepositAmount(answer);
          break;
        case "Account Opening Date":
          updatedModel.client.account_details.account_opening_date = answer;
          setAccountOpeningDate(answer);
          break;
        case "Branch Location":
          updatedModel.client.account_details.branch_location = answer;
          setBranchLocation(answer);
          break;
        case "Driving License":
          updatedModel.client.identification.driving_license.license_number = answer;
          setLicenseNumber(answer);
          break;
        case "DL Expiry Date":
          updatedModel.client.identification.driving_license.expiry_date = answer;
          setDlExpiryDate(answer);
          break;
        case "DL Issue State":
          updatedModel.client.identification.driving_license.issue_state = answer;
          setDlIssueState(answer);
          break;
        case "Street":
          updatedModel.client.address.street = answer;
          setStreet(answer);
          break;
        case "City":
          updatedModel.client.address.city = answer;
          setCity(answer);
          break;
        case "State":
          updatedModel.client.address.state = answer;
          setState(answer);
          break;
        case "ZIP Code":
          updatedModel.client.address.zip_code = answer;
          setPostalCode(answer);
          break;
        case "DL Issue Date":
          updatedModel.client.identification.driving_license.issue_date = answer;
          setDlIssueDate(answer);
          break;
        case "Date of Birth":
          updatedModel.client.personal_information.date_of_birth = answer;
          setDob(answer);
          break;
        case "SSN":
          updatedModel.client.personal_information.ssn = answer;
          setSsn(answer);
          break;
        case "Phone Number":
          updatedModel.client.personal_information.phone_number = answer;
          setPhoneNumber(answer);
          break;
        case "Email Address":
          updatedModel.client.personal_information.email_address = answer;
          setEmailAddress(answer);
          break;
        case "Occupation":
          updatedModel.client.personal_information.occupation.title = answer;
          setOccupationTitle(answer);
          break;
        case "Occupation Type":
          updatedModel.client.personal_information.occupation.type = answer;
          setOccupationType(answer);
          break;
        case "Annual Income":
          updatedModel.client.personal_information.annual_income = answer;
          setAnnualIncome(answer);
          break;
        case "Own or Rent House":
          updatedModel.client.personal_information.housing_status.own_or_rent = answer;
          setHousingStatus(answer);
          break;
        case "Marital Status":
          updatedModel.client.personal_information.housing_status.marital_status = answer;
          setMaritalStatus(answer);
          break;
        case "Citizenship":
          updatedModel.client.personal_information.citizenship_status.citizenship = answer;
          setCitizenship(answer);
          break;
        default:
          break;
      }
    });

    setClientDataModel(updatedModel);
  };

  useEffect(() => {
    const constraints = {
      video: false,
      audio: {
        channelCount: 1,
        sampleRate: 16000,
        sampleSize: 16,
        volume: 1
      }
    };

    const getMedia = async () => {
      let stream = null;
      try {
        stream = await navigator.mediaDevices.getUserMedia(constraints);
        createRecognizer(stream);
      } catch (err) {
        alert(err);
        console.log(err);
      }

      // Set initial pending task as the state of pendingTask
      setInitialPendingTask(pendingTasks);
    };

    getMedia();

    return () => {
      if (recognizer) stopRecognizer();
    };
  }, []);

  useEffect(() => {
    if (recognisedText) {
      analyzeGuidance();
      generateRecommendation().then((rec) => setRecommendation(rec));
    }
  }, [recognisedText, analyzeGuidance, generateRecommendation]);

  // Effect to append licenseDetails to transcript when populated
  useEffect(() => {
    if (licenseDetails) {
      const formattedDetails = `
        Driving License Details:
        - License Number: ${licenseDetails.licenseNumber}
        - Expiry Date: ${licenseDetails.expiryDate}
        - Issue Date: ${licenseDetails.issueDate}
        - Issue State: ${licenseDetails.issueState}
        - First Name: ${licenseDetails.firstName}
        - Last Name: ${licenseDetails.lastName}
        - Address: ${licenseDetails.address}
      `;

      setRecognisedText((prevTranscript) => `${prevTranscript}\n\n${formattedDetails}`);
    }
  }, [licenseDetails]);

  const createRecognizer = (audioStream) => {
    const audioConfig = AudioConfig.fromStreamInput(audioStream);
    recognizer = new SpeechRecognizer(speechConfig, audioConfig);

    recognizer.recognizing = (s, e) => {
      setRecognisingText(e.result.text);
      textRef.current.scrollTop = textRef.current.scrollHeight;
    };

    recognizer.recognized = (s, e) => {
      setRecognisingText("");
      if (e.result.reason === sdk.ResultReason.RecognizedSpeech) {
        setRecognisedText((prevText) => prevText + e.result.text + " ");
        textRef.current.scrollTop = textRef.current.scrollHeight;
      }
    };

    recognizer.canceled = (s, e) => {
      console.log(`CANCELED: Reason=${e.reason}`);
      if (e.reason === sdk.CancellationReason.Error) {
        console.log(`CANCELED: ErrorDetails=${e.errorDetails}`);
      }
      recognizer.stopContinuousRecognitionAsync();
    };

    recognizer.sessionStopped = (s, e) => {
      recognizer.stopContinuousRecognitionAsync();
    };
  };

  const startRecognizer = () => {
    recognizer.startContinuousRecognitionAsync();
    setIsRecognising(true);
  };

  const stopRecognizer = () => {
    setIsRecognising(false);
    recognizer.stopContinuousRecognitionAsync();
    // Call the final analyzeGuidance() and generateRecommendation() after stopping the recognizer
    setPendingTasks(initialPendingTask);
    analyzeGuidance();
    generateRecommendation().then((rec) => setRecommendation(rec));
    setPendingTasks(pendingTasks)
  };

  return (
    <Container className="mt-4">
      <h2>Contoso Banker Assist</h2>

      <Row className="mb-3">
        <Col>
          <Button variant={isRecognising ? "danger" : "primary"} onClick={toggleListener}>
            {isRecognising ? "Stop" : "Start"} Transcription
          </Button>
        </Col>
        <Col className="text-end">
          {/* <Button variant="primary">Chat Assist</Button> */}
          <ChatAssist transcript={recognisedText} />
        </Col>
      </Row>

      <Row className="mt-4">
        {/* Address and Contact Info Section */}
        <Col md={8}>
          <Card className="mb-4">
            <Card.Header>Personal Information</Card.Header>
            <Card.Body>
              <Row>
                <Col md={4}>
                  <Form.Group as={Row} className="d-flex align-items-center">
                    <Form.Label column sm="4">First Name</Form.Label>
                    <Col sm="8">
                      <Form.Control type="text" value={firstName || ''} readOnly />
                    </Col>
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group as={Row} className="d-flex align-items-center">
                    <Form.Label column sm="4">Last Name</Form.Label>
                    <Col sm="8">
                      <Form.Control type="text" value={lastName || ''} readOnly />
                    </Col>
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group as={Row} className="d-flex align-items-center">
                    <Form.Label column sm="4">Date of Birth</Form.Label>
                    <Col sm="8">
                      <Form.Control type="text" value={dob || ''} readOnly />
                    </Col>
                  </Form.Group>
                </Col>
              </Row>
              <Row className="mt-3">
                <Col md={4}>
                  <Form.Group as={Row} className="d-flex align-items-center">
                    <Form.Label column sm="4">SSN</Form.Label>
                    <Col sm="8">
                      <Form.Control type="text" value={ssn || ''} readOnly />
                    </Col>
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group as={Row} className="d-flex align-items-center">
                    <Form.Label column sm="4">Phone Number</Form.Label>
                    <Col sm="8">
                      <Form.Control type="text" value={phoneNumber || ''} readOnly />
                    </Col>
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group as={Row} className="d-flex align-items-center">
                    <Form.Label column sm="4">Email Address</Form.Label>
                    <Col sm="8">
                      <Form.Control type="text" value={emailAddress || ''} readOnly />
                    </Col>
                  </Form.Group>
                </Col>
              </Row>
              {/* Additional personal information fields */}
            </Card.Body>
          </Card>

          <Card className="mb-4">
            <Card.Header>Account Details</Card.Header>
            <Card.Body>
              <Row>
                <Col md={4}>
                  <Form.Group as={Row} className="d-flex align-items-center">
                    <Form.Label column sm="4">Account Type</Form.Label>
                    <Col sm="8">
                      <Form.Control type="text" value={accountType || ''} readOnly />
                    </Col>
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group as={Row} className="d-flex align-items-center">
                    <Form.Label column sm="4">Account Purpose</Form.Label>
                    <Col sm="8">
                      <Form.Control type="text" value={accountPurpose || ''} readOnly />
                    </Col>
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group as={Row} className="d-flex align-items-center">
                    <Form.Label column sm="4">Initial Deposit</Form.Label>
                    <Col sm="8">
                      <Form.Control type="text" value={initialDepositAmount || ''} readOnly />
                    </Col>
                  </Form.Group>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          <Card className="mb-4">
            <Card.Header>Address</Card.Header>
            <Card.Body>
              <Row>
                <Col md={4}>
                  <Form.Group as={Row} className="d-flex align-items-center">
                    <Form.Label column sm="4">Street</Form.Label>
                    <Col sm="8">
                      <Form.Control type="text" value={street || ''} readOnly />
                    </Col>
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group as={Row} className="d-flex align-items-center">
                    <Form.Label column sm="4">City</Form.Label>
                    <Col sm="8">
                      <Form.Control type="text" value={city || ''} readOnly />
                    </Col>
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group as={Row} className="d-flex align-items-center">
                    <Form.Label column sm="4">State</Form.Label>
                    <Col sm="8">
                      <Form.Control type="text" value={state || ''} readOnly />
                    </Col>
                  </Form.Group>
                </Col>
              </Row>
              <Row>
                <Col md={4}>
                  <Form.Group as={Row} className="d-flex align-items-center">
                    <Form.Label column sm="4">Zip</Form.Label>
                    <Col sm="8">
                      <Form.Control type="text" value={postalCode || ''} readOnly />
                    </Col>
                  </Form.Group>
                </Col>
                <Col></Col>
                <Col></Col>
              </Row>
            </Card.Body>
          </Card>

          <Card className="mb-4">
            <Card.Header>Identification</Card.Header>
            <Card.Body>
              <Row>
                <Col md={4}>
                  <Form.Group as={Row} className="d-flex align-items-center">
                    <Form.Label column sm="4">License Number</Form.Label>
                    <Col sm="8">
                      <Form.Control type="text" value={licenseNumber || ''} readOnly />
                    </Col>
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group as={Row} className="d-flex align-items-center">
                    <Form.Label column sm="4">Expiry Date</Form.Label>
                    <Col sm="8">
                      <Form.Control type="text" value={dlExpiryDate || ''} readOnly />
                    </Col>
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group as={Row} className="d-flex align-items-center">
                    <Form.Label column sm="4">Issue Date</Form.Label>
                    <Col sm="8">
                      <Form.Control type="text" value={dlIssueDate || ''} readOnly />
                    </Col>
                  </Form.Group>
                </Col>
              </Row>
            </Card.Body>
          </Card>


          <Card className="mb-4">
            <Row>
              <Col>
                <Card.Header>Active Transcript</Card.Header>
                <Card.Body>
                  <Form.Control as="textarea" rows={5} value={`${recognisedText}${recognisingText}`} readOnly ref={textRef} />
                </Card.Body>
              </Col>
              <Col>
                <Card.Header>Recommendation</Card.Header>
                <Card.Body>
                  <Form.Control as="textarea" rows={5} value={recommendation} readOnly />
                </Card.Body>
              </Col>
            </Row>
          </Card>
        </Col>

        {/* Client Data Model and Banker Insights */}
        <Col md={4}>
          <Card className="mb-4">
            <Card.Header>Client Data Model (Entities Extract/Live Guidance)</Card.Header>
            <Card.Body>
              <pre className="client-data-model">{JSON.stringify(clientDataModel, null, 2)}</pre>
            </Card.Body>
          </Card>

          <Card className="mb-4">
            <Card.Header>Banker Insights (Pending Tasks)</Card.Header>
            <Card.Body>
            <div className="banker-insights">
                {pendingTasks.map((task, index) => (
                  <p key={index}>{task}</p>
                ))}
              </div>
              <p className="text-danger">WARNING – Be careful to discuss race, color, religion</p>
            </Card.Body>
          </Card>

          <Card className="mb-4">
            <Card.Header>Driving License</Card.Header>
            <Card.Body>
              <pre className="client-data-model">{licenseDetails && (
                  <div>
                    <h4>Extracted Driving License Details:</h4>
                    <p><strong>License Number:</strong> {licenseDetails.licenseNumber}</p>
                    <p><strong>Expiry Date:</strong> {licenseDetails.expiryDate}</p>
                    <p><strong>Issue Date:</strong> {licenseDetails.issueDate}</p>
                    <p><strong>Issue State:</strong> {licenseDetails.issueState}</p>
                    <p><strong>First Name:</strong> {licenseDetails.firstName}</p>
                    <p><strong>Last Name:</strong> {licenseDetails.lastName}</p>
                    <p><strong>Address:</strong> {licenseDetails.address}</p>
                  </div>
                )}</pre>
            </Card.Body>
            <input type="file" accept="image/*" onChange={handleFileChange} />
            <button onClick={analyzeDrivingLicense} variant="primary">Upload ID</button>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default Transcription;
