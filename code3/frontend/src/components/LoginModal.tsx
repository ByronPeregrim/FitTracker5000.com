import { useForm } from "react-hook-form";
import { User } from "../models/users";
import { LoginCredentials } from "../network/users_api";
import * as UsersApi from "../network/users_api"
import { Button, Form, Modal } from "react-bootstrap";
import InputField from "./forms/InputField";
import styles from "../styles/LoginModal.module.css"

interface LoginModalProps {
    onDismiss: () => void,
    onLoginSuccessful: (user: User) => void,
}

const LoginModal = ({onDismiss, onLoginSuccessful}: LoginModalProps) => {
    const { register, handleSubmit, formState: { errors, isSubmitting}} = useForm<LoginCredentials>({
        mode: "onSubmit",
        reValidateMode: "onSubmit",
    });

    async function onSubmit(credentials: LoginCredentials) {
        try {
            const user = await UsersApi.login(credentials);
            onLoginSuccessful(user);
        } catch(error) {
            alert(error);
            console.error(error);
        }
    }

    let errorDisplayed = false;

    return (
        <Modal show onHide={onDismiss}>
            <div className={styles.banner_box}>
                <h1 className={styles.banner_text}>FitTracker5000</h1>
            </div>
            {errorDisplayed = false}
            <Modal.Body>
                <Form className={styles.user_login_form} onSubmit={handleSubmit(onSubmit)}>
                    { 
                        errors.username?.message?.length !== undefined && errorDisplayed === false ? 
                        <>
                            <p className={styles.login_error}>
                                { errors.username?.message }
                            </p>
                            {errorDisplayed = true}
                        </>
                        :null
                    }
                    { 
                        errors.password?.message?.length !== undefined && errorDisplayed === false? 
                        <>
                            <p className={styles.login_error}>
                                { errors.password?.message }
                            </p>
                            {errorDisplayed = true}
                        </>
                        :null
                    }
                    {
                        errorDisplayed === false ?
                        <>
                            <p id={styles.signup_form_text}>Enter username and password.</p>
                        </>
                        :null
                    }
                    <InputField
                        className={styles.input_account_info_box}
                        name="username"
                        label=""
                        type="text"
                        placeholder="Username"
                        register={register}
                        registerOptions={{
                            required:"Username is required",
                            pattern: {
                                value: /^[a-zA-Z0-9]+$/,
                                message: "Username and/or password are not valid",
                            },
                            validate: {
                                notIncorrectSize: (fieldValue) => {
                                    return (
                                        (fieldValue.length < 31 && fieldValue.length > 1) ||
                                        "Username and/or password are not valid"
                                    );
                                }
                            }
                        }}
                    />
                    <InputField
                        className={styles.input_account_info_box}
                        name="password"
                        label=""
                        type="password"
                        placeholder="Password"
                        register={register}
                        registerOptions={{
                            required:"Password is required",
                            pattern: {
                                value: /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]+$/,
                                message: "Username and/or password are not valid",
                            },
                            validate: {
                                notIncorrectSize: (fieldValue) => {
                                    return (
                                        (fieldValue.length < 25 && fieldValue.length > 7) ||
                                        "Username and/or password are not valid"
                                    );
                                }
                            }
                        }}
                    />
                     <div className={styles.button_box}>
                        <Button
                            type="button"
                            disabled={isSubmitting}
                        >   
                            Back
                        </Button>
                        <Button
                            type="submit"
                            disabled={isSubmitting}
                        >   
                            Submit
                        </Button>
                    </div>
                    <div className={styles.account_recovery_links}>
                        <Button
                            type="button"
                            disabled={isSubmitting}
                        >   
                            Forget Username?
                        </Button>
                        <Button
                            type="button"
                            disabled={isSubmitting}
                        >   
                            Reset Password?
                        </Button>
                    </div>
                </Form>
            </Modal.Body>
        </Modal>
    );

}

export default LoginModal;