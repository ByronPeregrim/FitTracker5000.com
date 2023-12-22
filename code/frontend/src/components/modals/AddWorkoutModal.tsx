import { Modal, Form, Button } from "react-bootstrap";
import { useForm } from "react-hook-form";
import styles from "../../styles/AddWorkoutModal.module.css"
import * as UsersApi from "../../network/users_api";
import { ConflictError, MissingParameters } from "../../errors/http_errors";
import { useState } from "react";
import { NewWorkoutInfo } from "../../network/users_api";
import { User } from "../../models/users";
import moment from "moment";
import { exercises } from "../../dictionaries/workouts";

interface AddWorkoutModalProps {
    currentUser : User | null,
    onAddWorkoutSuccessful : () => void,
    onBackButtonClicked: () => void,
}

const AddWorkoutModal = ({currentUser, onAddWorkoutSuccessful, onBackButtonClicked} : AddWorkoutModalProps) => {

    const [errorText, setErrorText] = useState<string | null>(null);

    const { register, handleSubmit, formState: { errors, isSubmitting }} = useForm<NewWorkoutInfo>({
        mode: "onSubmit",
        reValidateMode: "onSubmit",
    });

    const [duration, setDuration] = useState(0);
    const [exercise, setExercise] = useState("");
    const [totalCalories, setTotalCalories] = useState(0);
    const [showEstimatedCalories, setShowEstimatedCalories] = useState(0);
    const [showEnteredCalories, setShowEnteredCalories] = useState(0);

    async function onSubmit(newWorkoutInfo: NewWorkoutInfo) {
        try {
            newWorkoutInfo.calories = totalCalories;
            if (totalCalories > 0 && totalCalories <= 2000) {
                await UsersApi.addWorkout(newWorkoutInfo);
                alert("Add Workout Successful!");
                onAddWorkoutSuccessful();
            } else {
                setErrorText("Total calories must be between 0 and 2000.")
            }
        } catch (error) {
            if (error instanceof MissingParameters) {
                setErrorText(error.message);
            } else {
                alert(error);
            }
            console.error(error);
        }
    }

    const updateTotalCalories = (isAddition : boolean) => {
        if (showEnteredCalories < 2001 && showEnteredCalories > 0) {
            if (isAddition) {
                if (totalCalories + showEnteredCalories <= 2000) {
                    setTotalCalories(totalCalories + showEnteredCalories);
                } else {
                    setErrorText("Total calories may not exceed 2000.");
                }
            } else {
                if (totalCalories - showEnteredCalories >= 0) {
                    setTotalCalories(totalCalories - showEnteredCalories);
                } else {
                    setErrorText("Total calories may not subceed 0.");
                }
            }
        } else {
            setErrorText("Number of calories entered must be between 1 and 2000.")
        }
    }

    const calculateCalories = () => {
        const userWeight = currentUser?.weight;
        if (userWeight !== undefined) {
            if (exercise !== "") {
                if (duration <= 180 && duration > 0) {
                    const METScore = exercises[exercise];
                    let caloriesBurned = ((METScore * 3.5 * (userWeight/2.205)) / 200) * duration;
                    caloriesBurned = Math.round(caloriesBurned);
                    setShowEstimatedCalories(caloriesBurned);
                    setShowEnteredCalories(caloriesBurned);
                } else {
                    setErrorText("Duration must be between 1 and 180 minutes.");
                }
            } else {
                setErrorText("Must select exercise.");
            }
        } else {
            setErrorText("User weight not found.");
        }
    }

    const handleChange = (e: { preventDefault: () => void; target: { value: any; }; }) => {
        setShowEnteredCalories(Number(e.target.value));
    }

    let errorDisplayed = false;

    return ( 
        <Modal show>
            <Modal.Body className={styles.wrapper}>
                <div className={styles.banner_box}>
                    <h1 className={styles.banner_text}>FitTracker 5000</h1>
                </div>
                <div className={styles.modal_wrapper}>
                    <h2 className={styles.add_workout_text}>Add Workout</h2>
                    {errors.calories?.message?.toString().length !== undefined && errorDisplayed === false ?
                        <>
                            <p className={styles.error_message}>
                                { errors.calories?.message.toString() }
                            </p>
                            {errorDisplayed = true}
                        </>
                        :null
                    }
                    {errorText && errorDisplayed === false?
                        <>
                            {errorDisplayed = true}
                            <p className={styles.error_message}>
                                { errorText }
                            </p>
                        </>
                        :null
                    }
                    <div className={styles.add_workout_wrapper}>
                        <div className={styles.add_exercise_wrapper}>
                            <label htmlFor="exercises">Exercise:</label>
                            <select name="exercises" id="exercises" defaultValue={""} onChange={e => setExercise(e.target.value)}>
                                <option value="" disabled hidden>Choose exercise</option>
                                <option value="running">Running</option>
                                <option value="walking">Walking</option>
                                <option value="biking">Biking</option>
                                <option value="swimming">Swimming</option>
                                <option value="jumping-jacks">Jumping Jacks</option>
                                <option value="basketball">Basketball</option>
                                <option value="weight-lifting">Weight Lifting</option>
                            </select>
                            <label className={styles.duration_label} htmlFor="duration">Duration (mins):</label>
                            <div className={styles.duration_box}>
                                <input type="number" id="duration" name="duration" defaultValue={0} onChange={e => setDuration(Number(e.target.value))}/>
                                <Button
                                    type="button"
                                    disabled={isSubmitting}
                                    onClick={calculateCalories}
                                >
                                    Enter
                                </Button>
                            </div>
                            <p><b>Estimated Calories: </b>{showEstimatedCalories}</p>
                        </div>
                        <div className={styles.add_calories_wrapper}>
                            <div className={styles.enter_calories_box}>
                                <label htmlFor="calories"><b>Adjust Total Calories:</b></label>
                                <div>
                                    <Button type="button" onClick={() => updateTotalCalories(false)}>-</Button>
                                    <input type="number" id="calories" name="calories" value={showEnteredCalories.toString()} onChange={handleChange}/>
                                    <Button type="button" onClick={() => updateTotalCalories(true)}>+</Button>
                                </div>
                            </div>
                            <Form onSubmit={handleSubmit(onSubmit)}>
                                <input type="hidden" {...register("user")} defaultValue={currentUser?._id}/>
                                <input type="hidden" {...register("calories")} defaultValue={totalCalories}/>
                                <input type="hidden" {...register("date")} defaultValue={moment().format("MMM Do YY")}/>
                                <p className={styles.total_calories_text}><b>Total Calories Burned: </b>{totalCalories}</p>
                                <div className={styles.button_box}>
                                    <Button
                                        type="button"
                                        disabled={isSubmitting}
                                        onClick={onBackButtonClicked}
                                    >
                                        Back
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={isSubmitting}
                                    >
                                        Confirm
                                    </Button>
                                </div>
                            </Form>
                        </div>
                    </div>
                </div>
            </Modal.Body>
        </Modal>
     );
}
 
export default AddWorkoutModal;