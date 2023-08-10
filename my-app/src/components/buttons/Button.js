import React from 'react';
import CheckIcon from '@mui/icons-material/Check';
import { Button as ButtonBootstrap } from 'react-bootstrap';
import '../../styles/Button.css'; // Import the custom CSS

function Button({ onClick, icon, text }) {
    return (
        <ButtonBootstrap 
            onClick={onClick} 
            className="btn-custom d-flex align-items-center justify-content-center"
        >
            {icon && <span className="mr-2">{icon}</span>}
            {text}
        </ButtonBootstrap>
    );
}

export default Button;
