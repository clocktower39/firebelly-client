export let user = {
    isTrainer: false,
    themeMode: localStorage.getItem('theme'),
    customThemes: [],
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
    workoutType: "Strength",
    cardio: {},
};

export let progress = {
    exerciseList: [],
    exerciseSummariesByUser: {},
}

export let clients = [];
export let myTrainers = [];
export let trainers = [];
export let goals = [];

export let conversations = [];

export let metrics = {
    entriesByUser: {},
    pendingByUser: {},
    latestByUser: {},
};

export let scheduleEvents = {
    // scopeKey: {
    //   events: [ ...events ],
    //   range: { startDate, endDate },
    // }
};

export let sessionSummary = {};

export let workoutQueue = {
    // accountId: [ ...workouts ]
};

export let lastBulkOperation = null;
