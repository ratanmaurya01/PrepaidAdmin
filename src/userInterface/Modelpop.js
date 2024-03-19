// PopupDialog.js
import React from 'react';
import { Modal, Button } from 'react-bootstrap';

const PopupDialog = ({ isOpen, onCloseButtonLabel, onCloseButtonClick, title, children, okButtonLabel, onOk, showCancelButton }) => {
  return (
    <Modal show={isOpen} onHide={onCloseButtonClick} backdrop='static' style={{ position: 'fixed', top: '60%', left: '50%', transform: 'translate(-50%, -50%)' }} >
      <Modal.Header closeButton>
        <Modal.Title>{title}</Modal.Title>
      </Modal.Header>
      <Modal.Body>{children}</Modal.Body>
      <Modal.Footer>
        <div className="d-flex justify-content-center w-100">
          {showCancelButton && (
            <Button variant="secondary" onClick={onCloseButtonClick} style={{ marginRight: '20px' }}>
              {onCloseButtonLabel}
            </Button>
          )}
          <Button variant="primary" onClick={onOk}>
            {okButtonLabel}
          </Button>
        </div>
      </Modal.Footer>
    </Modal>
  );
};

export default PopupDialog;



// // PopupDialog.js
// import React from 'react';
// import { Modal, Button } from 'react-bootstrap';

// const PopupDialog = ({ isOpen, onCloseButtonLabel, onCloseButtonClick, title, children, okButtonLabel, onOk }) => {
//   return (
//     <Modal show={isOpen} onHide={onCloseButtonClick} backdrop='static' style={{ position: 'fixed', top: '60%', left: '50%', transform: 'translate(-50%, -50%)' }} >
//       <Modal.Header closeButton>
//         <Modal.Title>{title}</Modal.Title>
//       </Modal.Header>
//       <Modal.Body>{children}</Modal.Body>
//       <Modal.Footer>
//         <div className="d-flex justify-content-center w-100">

//           <Button variant="secondary" onClick={onCloseButtonClick}  style={{ marginRight: '20px' }}>
//             {onCloseButtonLabel}
//           </Button>
//           <Button variant="primary" onClick={onOk}>
//             {okButtonLabel}
//           </Button>
//         </div>
//       </Modal.Footer>
//     </Modal>
//   );
// };

// export default PopupDialog;
