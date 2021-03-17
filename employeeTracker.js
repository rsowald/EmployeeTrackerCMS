const inquirer = require('inquirer');
const getConnection = require('./db/connection');
let connection;

const displayMenu = async () => {
    const answer = await inquirer.prompt({
        name: 'action',
        type: 'list',
        message: 'What would you like to do?',
        choices: [
            { name: 'View all employees', value: viewEmployees },
            { name: 'View all roles', value: viewRoles },
            { name: 'View all departments', value: viewDepartments },
            { name: 'Add employee', value: insertEmployee },
            { name: 'Add role', value: insertRole },
            { name: 'Add department', value: insertDepartment },
            { name: 'Update employee role', value: updateEmployee },
            { name: 'Exit', value: 'exit' },
        ]
    });

    if (answer.action === 'exit') {
        await endProgram();
    }
    else {
        const fn = answer.action;
        await fn();
        await displayMenu();
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
};

const queryRoles = async () => {
    const [rows] = await connection.execute(
        `SELECT r.id, r.title, r.salary, d.name department
        FROM role r
        JOIN department d ON r.department_id = d.id`);

    console.table(rows)

    return rows;
}

const viewRoles = async () => {
    const rows = await queryRoles();
    console.table(rows);
};

const queryDepartments = async () => {
    const [rows] = await connection.execute(
        'SELECT * FROM departments');

    return rows;
}

const viewDepartments = async () => {
    const rows = await queryDepartments();

    console.table(rows);
};

const insertEmployee = async () => {
    const roles = await queryRoles();
    if (roles.length === 0) {
        console.log('You must first create a role.');
        return;
    }
    const employees = await queryEmployees();
    // prompt for info about the employee
    const answer = await inquirer.prompt([
        {
            name: 'first_name',
            type: 'input',
            message: "What is the employee's first name?",
        },
        {
            name: 'last_name',
            type: 'input',
            message: "What is the employee's last name?",
        },
        {
            name: 'role_id',
            type: 'list',
            message: "What is their job title?",
            choices: roles.map(r => ({ name: r.title, value: r.id })),
        },
        {
            name: 'manager_id',
            type: 'list',
            message: "What is their manager's name?",
            choices: [{ name: "none", value: null }].concat(employees.map(r => ({ name: r.first_name + r.last_name, value: r.id })))
        }
    ]);

    // when finished prompting, insert a employee into the db with that info
    await connection.execute(
        'INSERT INTO employee SET ?',
        {
            ...answer
        });
    console.log('Your employee was added successfully!');
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
};

const updateEmployee = async () => {

};

const endProgram = async () => {
    await connection.end();
}

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

};

async function main() {
    connection = await getConnection();
    await displayMenu();
};

main();
