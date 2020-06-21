type UserType = {
    id: string
    role: UserRole
};

export enum UserRole {
    PARTICIPANT = "PARTICIPANT",
    ADMIN = "ADMIN"
}

export default UserType;