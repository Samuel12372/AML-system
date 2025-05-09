import { Modal, Form, Input, Button } from "antd";
import { useState } from "react";
import axios from 'axios';


const Login = ({ open, onClose, onSuccess }) => {

    // State to toggle between login and register form
    const [isRegister, setIsRegister] = useState(false);
    // State to set the form name
    const [formName, setFormName] = useState('Login');
    // State to store error message
    const [errorMessage, setErrorMessage] = useState('');
    //success message
    const [successMessage, setSuccessMessage] = useState('');
    // Form instance
    const [form] = Form.useForm();

    const [mfaVisible, setMfaVisible] = useState(false);
    const [mfaCode, setMfaCode] = useState('');
    const [mfaUserId, setMfaUserId] = useState('');
    const [mfaTempToken, setMfaTempToken] = useState('');
    const [mfaError, setMfaError] = useState('');

    
    // Function to toggle between login and register form
    const toggleFormType = () => {
        setFormName(isRegister ? 'Login' : 'Register');
        setIsRegister(!isRegister);
        setErrorMessage('');
        setSuccessMessage('');
    };

    // Function to handle modal close
    const handleClose = () => {
        form.resetFields();
        setErrorMessage('');
        setSuccessMessage('');
        setIsRegister(false);
        onClose();
    };

    // Function to handle form submission
    const handleFormSubmit = (values) => {
        if (isRegister) {
            axios.post(`http://localhost:8080/api/user/register`, values)
            .then((res) => {
                console.log(res);
                setErrorMessage('');
                setSuccessMessage('Registration successful! You can now log in.');
                setIsRegister(false);
            })
            .catch((error) => {
                console.log(error);
                setSuccessMessage('');
                setErrorMessage('Registration failed. Please try again.');
            });

        } else {
            axios.post(`http://localhost:8080/api/user/login`, values)
            .then((res) => {
                //console.log(res);
                if (res.data.mfaRequired) {
                    // Show MFA modal if required
                    setMfaVisible(true);
                    setMfaUserId(res.data.userId);
                    setMfaTempToken(res.data.tempToken); // Optional, for extra verification
                    setErrorMessage('');
                    } else {
                    // Normal login
                    localStorage.setItem('userId', res.data.userId);
                    localStorage.setItem('token', res.data.token);
                    onSuccess(res.data.userId, res.data.userName, res.data.role);
                }
            })
            .catch((error) => {
                console.log(error);
                setErrorMessage('Login failed. Please check your credentials and try again.');
            });
        }
    };


    return (
        <div >
           <Modal
           className="login"
            title={formName}
            open={open}
            onCancel={handleClose}
            footer={null}
            >
                <Form  form={form} onFinish={handleFormSubmit}>
                    <Form.Item
                        label="Username"
                        name="username"
                        rules={[
                            {
                            required: true,
                            message: 'Please input your username!',
                            },
                        ]}
                        >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        label="Password"
                        name="password"
                        rules={[
                            {
                            required: true,
                            message: 'Please input your password!',
                            },
                        ]}
                    >
                        <Input.Password />
                    </Form.Item>

                    {/* Display email field only for registration */}
                    
                    {isRegister && (
                        <Form.Item
                            label="Email"
                            name="email"
                            rules={[
                                {
                                required: true,
                                message: 'Email is required!',
                                },
                            ]}
                        >
                            <Input />
                        </Form.Item>
                    )}

                    <Form.Item>
                        <Button type="text" onClick={toggleFormType}>
                            {isRegister ? 'Already have an account? Login' : "Don't have an account? Register"}
                        </Button>
                    </Form.Item>
                    {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
                    {successMessage && <p style={{ color: 'green' }}>{successMessage}</p>}
                    <Form.Item>
                        <Button type="primary" htmlType="submit" id="LoginButton">
                            {isRegister ? 'Register' : 'Login'}
                        </Button>
                    </Form.Item>
                </Form>
            </Modal>

            <Modal
            title="Multi-Factor Authentication"
            open={mfaVisible}
            onCancel={() => setMfaVisible(false)}
            footer={null}
            >
            <Form
                onFinish={() => {
                axios.post('http://localhost:8080/api/user/mfa/verify', {
                    id: mfaUserId,
                    token: mfaCode,
                    tempToken: mfaTempToken, // Optional if you add temp session tracking
                })
                .then((res) => {
                    localStorage.setItem('userId', mfaUserId);
                    localStorage.setItem('token', res.data.token); // Get final token
                    setMfaVisible(false);
                    onSuccess(mfaUserId, res.data.userName, res.data.role);
                })
                .catch((err) => {
                    setMfaError('Invalid MFA code. Try again.');
                });
                }}
            >
                <Form.Item
                label="MFA Code"
                name="mfa"
                rules={[{ required: true, message: 'Enter the MFA code from your app' }]}
                >
                <Input value={mfaCode} onChange={(e) => setMfaCode(e.target.value)} />
                </Form.Item>

                {mfaError && <p style={{ color: 'red' }}>{mfaError}</p>}

                <Form.Item>
                <Button type="primary" htmlType="submit">
                    Verify
                </Button>
                </Form.Item>
            </Form>
            </Modal>
        </div>
    );
};

export default Login;