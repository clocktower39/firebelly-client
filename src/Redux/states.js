export let user = {
    isTrainer: false,
}

export let dailyTasks = {
    tasks: [],
    // {
    //     title: 'Handstand',
    //     goal: 1,
    //     achieved: 1,
    // },
    // {
    //     title: 'Planche',
    //     goal: 1,
    //     achieved: 1,
    // },
    // {
    //     title: 'Lever',
    //     goal: 1,
    //     achieved: 1,
    // },
    // {
    //     title: 'Push ups',
    //     goal: 1,
    //     achieved: 1,
    // },
    // {
    //     title: 'Pull ups',
    //     goal: 1,
    //     achieved: 1,
    // },
    // {
    //     title: 'Pistol Squats',
    //     goal: 1,
    //     achieved: 1,
    // },
};

export let dailyTraining = {
    trainingCategory: "",
    training:[
    // [
    //     {
    //         exercise: "Incline DB Chest Press",
    //         goals: {
    //             sets: 4,
    //             minReps: 12,
    //             maxReps: 15,
    //         },
    //         achieved: {
    //             sets: 4,
    //             reps: [],
    //         }
    //     }
    // ],
]};

export let dailyNutrition = [
    // {
    //     title: 'Calories In',
    //     goal: 3000,
    //     achieved: 0,
    //     unit: 'calories',
    // },
];

export let tasks = [];

export let training = [];

export let nutrition = [];

export let notes = [
    // {
    //     date: '',
    //     accountId: '',
    //     note: '',
    // },
]

export let progress = {
    exerciseList: [],
    targetExerciseHistory: []
}

export let calander = {
    dailyView:{
        dailyTasks,
        dailyTraining,
        dailyNutrition,
    },
    weeklyView:[
        {},
        {},
        {},
        {},
        {},
        {},
        {},
    ],
    monthlyView:{
    },
}