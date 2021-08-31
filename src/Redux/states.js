export let user = {
}

export let dailyTasks = [
    {
        title: 'Handstand',
        unit: 'seconds',
        goal: 0,
        achieved: 0,
    },
    {
        title: 'Planche',
        unit: 'seconds',
        goal: 0,
        achieved: 0,
    },
    {
        title: 'Lever',
        unit: 'seconds',
        goal: 0,
        achieved: 0,
    },
    {
        title: 'Push ups',
        unit: 'amount',
        goal: 0,
        achieved: 0,
    },
    {
        title: 'Pull ups',
        unit: 'amount',
        goal: 0,
        achieved: 0,
    },
    {
        title: 'Pistol Squats',
        unit: 'amount',
        goal: 0,
        achieved: 0,
    },
];

export let dailyTraining = {
    trainingCategory: "Push, Muscular Endurance",
    training:[
    [
        {
            exercise: "Incline DB Chest Press",
            goals: {
                sets: 4,
                minReps: 12,
                maxReps: 15,
            },
        }
    ],
    [
        {
            exercise: "Dips",
            goals: {
                sets: 4,
                minReps: 12,
                maxReps: 15,
            },
        },
        {
            exercise: "DB Lateral Raises",
            goals: {
                sets: 4,
                minReps: 12,
                maxReps: 15,
            },
        },
    ],
    [
        {
            exercise: "Seated DB Arnold Press",
            goals: {
                sets: 4,
                minReps: 12,
                maxReps: 15,
            },
        },
        {
            exercise: "DB Chest Fly",
            goals: {
                sets: 4,
                minReps: 12,
                maxReps: 15,
            },
        },
    ],
    [
        {
            exercise: "Cable Triangle Tricep Pushdown",
            goals: {
                sets: 4,
                minReps: 12,
                maxReps: 15,
            },
        },
        {
            exercise: "Cable Rope Tricep Pushdown",
            goals: {
                sets: 4,
                minReps: 12,
                maxReps: 15,
            },
        },
    ],
]};

export let dailyNutrition = [
    {
        title: 'Calories In',
        goal: 0,
        achieved: 0,
    },
    {
        title: 'Calories Out',
        goal: 0,
        achieved: 0,
    },
    {
        title: 'Protein',
        goal: 0,
        achieved: 0,
    },
    {
        title: 'Carbs',
        goal: 0,
        achieved: 0,
    },
    {
        title: 'Fats',
        goal: 0,
        achieved: 0,
    },
];

export let weeklyTasks = [dailyTasks,dailyTasks,dailyTasks,dailyTasks,dailyTasks,dailyTasks,dailyTasks];
export let weeklyTraining = [dailyTraining,dailyTraining,dailyTraining,dailyTraining,dailyTraining,dailyTraining,dailyTraining];
export let weeklyNutrition = [dailyNutrition,dailyNutrition,dailyNutrition,dailyNutrition,dailyNutrition,dailyNutrition,dailyNutrition];

export let monthlyTasks = [weeklyTasks,weeklyTasks,weeklyTasks,weeklyTasks];
export let monthlyTraining = [weeklyTraining,weeklyTraining,weeklyTraining,weeklyTraining];
export let monthlyNutrition = [weeklyNutrition,weeklyNutrition,weeklyNutrition,weeklyNutrition];

export let calander = {
    dailyView:{
        dailyTasks,
        dailyTraining,
        dailyNutrition,
    },
    weeklyView:{
        weeklyTasks,
        weeklyTraining,
        weeklyNutrition,
    },
    monthlyView:{
        monthlyTasks,
        monthlyTraining,
        monthlyNutrition,
    },
}