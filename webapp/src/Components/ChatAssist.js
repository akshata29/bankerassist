import React, { useState } from 'react';
import { Modal, Button, Form, Container } from 'react-bootstrap';
import axios from 'axios';

const AZURE_OPENAI_ENDPOINT = process.env.REACT_APP_AZURE_OPENAI_ENDPOINT;
const AZURE_OPENAI_KEY = process.env.REACT_APP_AZURE_OPENAI_KEY;
const AZURE_OPENAI_MODEL = process.env.REACT_APP_AZURE_OPENAI_MODEL;
const AZURE_OPENAI_VERSION = process.env.REACT_APP_AZURE_OPENAI_VERSION;

const ChatAssist = ({ transcript }) => {
  const [show, setShow] = useState(false);
  const [question, setQuestion] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);

  const handleShow = () => setShow(true);
  const handleClose = () => setShow(false);

  const handleQuestionChange = (e) => setQuestion(e.target.value);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!question) return;

    setLoading(true);

    const prompt = `
      Based on the following transcript of a conversation between a banker and a customer, answer the question or perform the requested task.

      Transcript:
      ${transcript}

      Question:
      ${question}
    `;

    try {
      const response = await axios.post(
        `${AZURE_OPENAI_ENDPOINT}/openai/deployments/${AZURE_OPENAI_MODEL}/chat/completions?api-version=${AZURE_OPENAI_VERSION}`,
        {
          messages: [{ role: "user", content: prompt }],
          temperature: 0.5,
          max_tokens: 1500,
        },
        {
          headers: {
            "Authorization": `Bearer ${AZURE_OPENAI_KEY}`,
            "Content-Type": "application/json",
            'api-key': AZURE_OPENAI_KEY
          },
        }
      );

      setResponse(response.data.choices[0].message.content);
    } catch (error) {
      console.error("Error getting response:", error);
      setResponse("An error occurred while generating the response.");
    } finally {
      setLoading(false);
      setQuestion(''); // Clear the question input
    }
  };

  return (
    <>
      <Button variant="primary" onClick={handleShow}>
        Chat Assist
      </Button>

      <Modal show={show} onHide={handleClose} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Chat Assist</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Container>
            <Form onSubmit={handleSubmit}>
              <Form.Group>
                <Form.Label>Assistant Response</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={10}
                  value={response}
                  readOnly
                  className="scrollable-textbox"
                />
              </Form.Group>
              <Form.Group className="mt-3">
                <Form.Label>Ask a Question</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter your question"
                  value={question}
                  onChange={handleQuestionChange}
                />
              </Form.Group>
              <Button variant="primary" type="submit" disabled={loading} className="mt-3">
                {loading ? 'Loading...' : 'Submit'}
              </Button>
            </Form>
          </Container>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default ChatAssist;