/* Author: Jonathan Lamontagne-Kratz */

import React from 'react';
import styles from './Button.module.css';

function Button({ children, variant = 'primary', onClick, type = 'button', className = '' }) {
    // Selects the right class based on the variant prop (primary, secondary, danger)
    const buttonClass = `${styles.btn} ${styles[variant]} ${className}`;

    return (
        <button type={type} onClick={onClick} className={buttonClass}>
            {children}
        </button>
    );
}

export default Button;