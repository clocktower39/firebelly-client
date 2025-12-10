export let user = {
    isTrainer: false,
    themeMode: localStorage.getItem('theme'),
}

export let exerciseLibrary = [];

export let workouts = {
    // user_id: {
    //     workouts: [ ...workouts ]
    // }
};

export let training = {
    category: "",
    training: [],
};

export let progress = {
    exerciseList: [],
}

export let clients = [];
export let myTrainers = [];
export let trainers = [];
export let goals = [];

export let conversations = [];