/* Author: Jonathan Lamontagne-Kratz */

import React from 'react';
import styles from './Input.module.css';

function Input({ label, type = 'text', value, onChange, placeholder, required }) {
    return (
        <div className={styles.inputWrapper}>
            {label && <label className={styles.label}>{label}</label>}
            <input
                type={type}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                required={required}
                className={styles.input}
            />
        </div>
    );
}

export default Input;