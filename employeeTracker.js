const inquirer = require('inquirer');
const connection = require('db/connection');

const runMenu = async () => {
    const answer = await inquirer.prompt({
        name: 'action',
        type: 'list',
        message: 'What would you like to do?',
        choices: [
            'View all employees',
            'View all roles',
            'View all departments',
            'Add employee',
            'Add role',
            'Add department',
            'Update employee role',
            'exit',
        ]
    });

    switch (answer.action) {
        case 'View all employees':

            break;

        case 'View all roles':

            break;

        case 'View all departments':

            break;

        case 'Add employee':

            break;

        case 'Add role':

            break;

        case 'Add department':

            break;

        case 'Update employee role':

            break;

        case 'Exit':
            connection.end();
            break;

        default:
            console.log(`Invalid action: ${answer.action}`);
            break;
    }
};



connection.connect((err) => {
    if (err) throw err;
    runMenu();
});