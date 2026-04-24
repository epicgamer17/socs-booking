
import React from 'react';
import Button from './Button';

function MailtoButton({ email,subject = "",body = "",children,className="",variant = "primary",}) {

    const params = new URLSearchParams();
    if (subject) {
        params.append("subject",subject)
    }

    if (body) {
        params.append("body",body)
        
    }

    const href = `mailto:${email}?${params.toString()}`;

    function handleClick(){
        window.location.href = href;
    };

    return (
        <Button onClick={handleClick} className={className} variant={variant}>
            {children||"Send Email"}
        </Button>
    );
}


export default MailtoButton;