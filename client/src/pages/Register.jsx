import React from 'react';
import { SignUp } from '@clerk/clerk-react';

const Register = () => {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 72px)', padding: '1rem' }}>
      <SignUp appearance={{
        elements: {
          rootBox: "aura-card",
          card: {
            background: 'var(--aura-card)',
            border: '1px solid var(--aura-glass-border)',
            boxShadow: 'none'
          },
          headerTitle: {
            color: 'var(--aura-text)',
            fontWeight: '900'
          },
          headerSubtitle: {
            color: 'var(--aura-text-muted)'
          },
          socialButtonsBlockButton: {
            background: 'var(--aura-glass)',
            border: '1px solid var(--aura-glass-border)',
            color: 'var(--aura-text)'
          },
          formButtonPrimary: "btn-aura btn-aura-primary",
          formFieldLabel: {
            color: 'var(--aura-text-muted)'
          },
          formFieldInput: "aura-input",
          footerActionLink: {
            color: 'var(--aura-primary)'
          }
        }
      }} />
    </div>
  );
};

export default Register;
