/* Author: Tanav Bansal*/

import React from 'react';
import Button from './Button';

function MailtoButton({ email, subject = "", body = "", children, className = "", variant = "primary", }) {

    const params = new URLSearchParams();
    if (subject) {
        params.append("subject", subject)
    }

    if (body) {
        params.append("body", body)

    }

    const formatedParams = params.toString().replace(/\+/g, "%20");
    const mailtoUrl =formatedParams?  `mailto:${email.trim()}?${formatedParams}` : `mailto:${email.trim()}`


    function handleClick() {
        window.open(mailtoUrl);
    };

    return (
        <Button onClick={()=>handleClick()} className={className} variant={variant}>
            {children || "Send Email"}
        </Button>
    );
}


export default MailtoButton;