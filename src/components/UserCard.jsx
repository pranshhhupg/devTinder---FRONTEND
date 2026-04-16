const UserCard = ({user}) => {
    const {firstName, lastName, age, gender, hobbies, photoUrl, about} = user;

    return (
        <div className="card bg-base-200 w-85 mt-10 mx-auto myshadow-sm">
            <figure>
                <img
                src={photoUrl}
                alt="User Image" />
            </figure>
            <div className="card-body">
                <h2 className="card-title text-2xl">{firstName + " " + lastName}</h2>
                <div className="flex mt-[-10px]">
                    {age && <h2 className="text-md text-gray-200">{age +", "} </h2>}
                    {gender && <h2 className="text-md ml-1 text-gray-200">{gender}</h2>}
                </div>
                <h1 className="text-md text-gray-400 pr-2">{about}</h1>
                <div className="card-actions justify-center p-2">
                    <button className="btn btn-primary mr-1">Not Interested</button>
                    <button className="btn btn-secondary">Interested</button>
                </div>
            </div>
        </div>
    )
};

export default UserCard;