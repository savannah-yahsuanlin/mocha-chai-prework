const { faker } = require('@faker-js/faker')
const {Sequelize, STRING, TEXT} = require('sequelize')
const conn = new Sequelize(process.env.DATABASE_URL || 'postgres://localhost/acme_db')


const Employee = conn.define('employee', {
	name: {
		type: STRING
	},
	bio: {
		type: TEXT
	}
})

const Department= conn.define('department', {
	name: {
		type: STRING
	}
})

Employee.belongsTo(Department)


Employee.addHook('beforeSave', (employee) => {
	if(!employee.bio) {
		employee.bio = `This is bio ${employee.name} ${faker.lorem.words(10)} ${employee.name}`
	}
})

const syncAndSeed = async() => {

	await conn.sync({force: true})
	
	const [moe, lucy, larry] = await Promise.all(['moe', 'lucy', 'larry'].map(name => Employee.create({name})))
	const [hr, eng] = await Promise.all(['hr', 'eng'].map(name => Department.create({name})))

	lucy.departmentId = eng.id
	larry.departmentId = eng.id
	moe.departmentId = hr.id

	await lucy.save()
	await larry.save()
	await moe.save()

	return {
		employees: {moe, lucy, larry},
		departments: {hr, eng}
	}
}



module.exports = {
	syncAndSeed
}