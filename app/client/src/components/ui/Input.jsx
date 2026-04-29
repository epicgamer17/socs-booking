/* Author: Jonathan Lamontagne-Kratz */

import React from 'react';
import styles from './Input.module.css';

function Input({ label, type = 'text', value, onChange, placeholder, required, step }) {
    // Default step for time input is 15 minutes (900 seconds)
    const inputStep = step || (type === 'time' ? '900' : undefined);

    return (
        <div className={styles.inputWrapper}>
            {label && <label className={styles.label}>{label}</label>}
            <input
                type={type}
                value={value}
                onChange={onChange}
                step={inputStep}
                onClick={(e) => {
                    if (type === 'date' || type === 'time') {
                        try {
                            e.target.showPicker();
                        } catch (err) {}
                    }
                }}
                onFocus={(e) => {
                    if (type === 'date' || type === 'time') {
                        try {
                            e.target.showPicker();
                        } catch (err) {}
                    }
                }}
                placeholder={placeholder}
                required={required}
                className={styles.input}
            />
        </div>
    );
}

export default Input;