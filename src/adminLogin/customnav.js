import React from 'react';
import { Navbar, Nav, Container } from 'react-bootstrap';


const CustomNavbar = () => {
  return (

    <>
    
    <Navbar bg="dark" variant="dark" expand="lg" fixed='top'>
      <Container>
        <Navbar.Brand className='logo' href="/">RSTAR</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto">
            <Nav.Link className='Navlink' href="/">Home</Nav.Link>
            <Nav.Link className='Navlink' href="/about">About </Nav.Link>
            <Nav.Link className='Navlink' href="/contact">Contact</Nav.Link>
            <Nav.Link className='Navlink' href="/adminpage/login">Log In </Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>




    </>
  );
};

export default CustomNavbar;
