export let user = {
}

export let dailyTasks = [
    {
        title: 'Handstand',
        goal: 1,
        achieved: 1,
        date: new Date(),
    },
    {
        title: 'Planche',
        goal: 1,
        achieved: 1,
        date: new Date(),
    },
    {
        title: 'Lever',
        goal: 1,
        achieved: 1,
        date: new Date(),
    },
    {
        title: 'Push ups',
        goal: 1,
        achieved: 1,
        date: new Date(),
    },
    {
        title: 'Pull ups',
        goal: 1,
        achieved: 1,
        date: new Date(),
    },
    {
        title: 'Pistol Squats',
        goal: 1,
        achieved: 1,
        date: new Date(),
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
            achieved: {
                sets: 4,
                reps: [],
            }
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
            achieved: {
                sets: 0,
                reps: [],
            }
        },
        {
            exercise: "DB Lateral Raises",
            goals: {
                sets: 4,
                minReps: 12,
                maxReps: 15,
            },
            achieved: {
                sets: 0,
                reps: [],
            }
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
            achieved: {
                sets: 0,
                reps: [],
            }
        },
        {
            exercise: "DB Chest Fly",
            goals: {
                sets: 4,
                minReps: 12,
                maxReps: 15,
            },
            achieved: {
                sets: 0,
                reps: [],
            }
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
            achieved: {
                sets: 0,
                reps: [],
            }
        },
        {
            exercise: "Cable Rope Tricep Pushdown",
            goals: {
                sets: 4,
                minReps: 12,
                maxReps: 15,
            },
            achieved: {
                sets: 0,
                reps: [],
            }
        },
    ],
]};

export let dailyNutrition = [
    {
        title: 'Calories In',
        goal: 3000,
        achieved: 0,
        unit: 'calories',
    },
    {
        title: 'Calories Out',
        goal: 1200,
        achieved: 1200,
        unit: 'calories',
    },
    {
        title: 'Protein',
        goal: 150,
        achieved: 150,
        unit: 'grams',
    },
    {
        title: 'Carbs',
        goal: 0,
        achieved: 0,
        unit: 'grams',
    },
    {
        title: 'Fats',
        goal: 0,
        achieved: 0,
        unit: 'grams',
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