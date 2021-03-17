const inquirer = require('inquirer');
const getConnection = require('db/connection');
let connection;

const displayMenu = async () => {
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
            viewEmployees();
            break;

        case 'View all roles':
            viewRoles();
            break;

        case 'View all departments':
            viewDepartments();
            break;

        case 'Add employee':
            insertEmployee();
            break;

        case 'Add role':
            insertRole();
            break;

        case 'Add department':
            insertDepartment();
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

const queryEmployees = async () => {
    const [rows] = await connection.execute(
        `SELECT e.id, e.first_name, e.last_name, r.title, d.name department, r.salary, m.first_name + m.last_name manager
        FROM employee e
        LEFT JOIN employee m ON e.manager_id = m.id
        JOIN role r ON e.role_id = r.id
        JOIN department d ON r.department_id = d.id`);

    return rows;
};

const viewEmployees = async () => {
    const rows = await queryEmployees();
    console.table(rows);
    displayMenu();
};

const queryRoles = async () => {
    const [rows] = await connection.execute(
        `SELECT r.id, r.title, r.salary, d.name department
        FROM role r
        JOIN department d ON r.department_id = d.id`);

    return rows
}

const viewRoles = async () => {
    const rows = await queryRoles();
    console.table(rows);
    displayMenu();

};

const queryDepartments = async () => {
    const [rows] = await connection.execute(
        'SELECT * FROM departments');

    return rows;
}

const viewDepartments = async () => {
    const rows = await queryDepartments();

    console.table(rows);
    displayMenu();

};

const insertEmployee = async () => {
    const roles = await queryRoles();
    const employees = await queryEmployees();
    // prompt for info about the employee
    const answer = await inquirer.prompt([
        {
            name: 'firstName',
            type: 'input',
            message: "What is the employee's first name?",
        },
        {
            name: 'lastName',
            type: 'input',
            message: "What is the employee's last name?",
        },
        {
            name: 'role',
            type: 'input',
            message: "What is their job title?",
            choices: roles.map(r => r.name),
        },
        {
            name: 'manager',
            type: 'input',
            message: "What is their manager's name? (leave blank if NULL)",
            choices: employees.map(r => r.first_name + r.last_name)
        }
    ]);

    // when finished prompting, insert a employee into the db with that info
    await connection.execute(
        'INSERT INTO employee SET ?',
        {
            first_name: answer.firstName,
            last_name: answer.lastName,
            role_id: answer.role,
            //TODO: get role ids from role table
            manager_id: answer.manager || NULL,
        });
    console.log('Your employee was added successfully!');
    // re-direct to the menu
    displayMenu();

};

const insertRole = async () => {
    const rows = await queryDepartments();

    // prompt for info about the role
    const answer = await inquirer.prompt([
        {
            name: 'title',
            type: 'input',
            message: "What is the job title?",
        },
        {
            name: 'salary',
            type: 'input',
            message: "What is the salary for this role?",
            validate(value) {
                return isNaN(value) === false;
            },
        },
        {
            name: 'department_id',
            type: 'list',
            message: "To which department does this role belong?",
            choices: rows.map(r => ({ name: r.name, value: r.id }))
        },
    ]);

    // when finished prompting, insert a role into the db with that info
    await connection.execute(
        'INSERT INTO role SET ?',
        {
            ...answer
        });
    console.log('The role was added successfully!');
    // re-direct to the menu
    displayMenu();

};

const insertDepartment = async () => {
    // prompt for info about the role
    const answer = await inquirer.prompt([
        {
            name: 'name',
            type: 'input',
            message: "What is the name of the department?",
        },
    ]);

    // when finished prompting, insert a department into the db with that info
    await connection.execute(
        'INSERT INTO department SET ?',
        {
            ...answer
        });
    console.log('The department was added successfully!');
    // re-direct to the menu
    displayMenu();

};

async function main() {
    connection = await getConnection();
    await displayMenu();
};

main();
