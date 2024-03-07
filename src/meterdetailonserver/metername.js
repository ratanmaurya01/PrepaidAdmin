import React, { useState } from 'react';
import { Modal, Button } from 'react-bootstrap';

const Metername = () => {
  const [show, setShow] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const handleClose = () => {
      
    setName("");
    setEmail("");
    setShow(false);

  };
  const handleShow = () => setShow(true);

  const handleNameChange = (e) => {
    setName(e.target.value);
  };

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
  };

  const handleSubmit = () => {
    // Handle form submission logic here
    console.log("Name:", name);
    console.log("Email:", email);
    // You can add further logic or send the data to an API
    // Reset the state or close the modal if needed
    setName("");
    setEmail("");
    setShow(false);
  };

  return (
    <>
      <Button variant="primary" onClick={handleShow}>
        Open Popup
      </Button>

      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Popup Title</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <input
            type='text'
            value={name}
            onChange={handleNameChange}
            placeholder='Enter name'
          />
          <br />
          <input
            type='text'
            value={email}
            onChange={handleEmailChange}
            placeholder='Enter email address'
          />

           <br></br>

<Button variant="primary" onClick={handleSubmit}>
            Save Changes
          </Button>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
          
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default Metername;
