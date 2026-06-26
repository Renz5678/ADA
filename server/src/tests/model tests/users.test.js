import { Sequelize, DataTypes } from "sequelize";
import UsersFactory from '../../models/users.js'

const sequelize = new Sequelize('sqlite::memory:', { logging: false });
const Users = UsersFactory(sequelize, DataTypes);

describe('Users model', () => {
    it('should hash password before create', async () => {
        const user = Users.build({
            username: 'test',
            email: 'test@gmail.com',
            password: 'plainpassword'
        });

        await Users.runHooks('beforeCreate', user, {});

        expect(user.password).not.toBe('plainpassword');
        expect(user.password.length).toBeGreaterThan(0);
    });

    it('should compare password correctly', async () => {
        const user = Users.build({
            username: 'test',
            email: 'test@gmail.com',
            password: 'plainpassword'
        });

        await Users.runHooks('beforeCreate', user, {});

        const match = await Users.comparePassword('plainpassword', user);
        const mismatch = await Users.comparePassword('wrongpassword', user);

        expect(match).toBe(true);
        expect(mismatch).toBe(false);
    });


    it('should fail validation on empty username', async () => {
        const user = Users.build({
            username: '',
            email: 'test@gmail.com',
            password: 'plainpassword'
        })

        await expect(user.validate()).rejects.toThrow();
    });

    it('should fail validation on wrong email', async () => {
        const user = Users.build({
            username: 'renz',
            email: 'testgmail.com',
            password: 'plainpassword'
        })

        await expect(user.validate()).rejects.toThrow();
    });
});