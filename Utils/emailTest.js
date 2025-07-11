import { sendVerificationEmail, sendPasswordResetEmail } from './emailService.js';

const testEmail = '2910viwan@gmail.com';
const testToken = 'testtoken123';

async function testEmails() {
    try {
        await sendVerificationEmail(testEmail, testToken);
        console.log('Verification email sent successfully!');
    } catch (err) {
        console.error('Error sending verification email:', err);
    }

    try {
        await sendPasswordResetEmail(testEmail, testToken);
        console.log('Password reset email sent successfully!');
    } catch (err) {
        console.error('Error sending password reset email:', err);
    }
}

testEmails();