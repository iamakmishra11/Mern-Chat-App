import React, { useContext, useState, useEffect } from 'react';
import { UserContext } from '../context/user.context';
import api from '../config/axios'; // Use the configured Axios instance
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const Home = () => {
    const { user } = useContext(UserContext);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [projectName, setProjectName] = useState(null);
    const [project, setProject] = useState([]);
    const navigate = useNavigate();

    function createProject(e) {
        e.preventDefault();
        api.post('/projects/create', {
            name: projectName,
        })
            .then((res) => {
                setIsModalOpen(false);
            })
            .catch((error) => {
                console.log(error);
            });
    }

    useEffect(() => {
        api.get('/projects/all')
            .then((res) => {
                setProject(res.data.projects);
            })
            .catch(err => {
                console.log(err);
            });
    }, []);

    return (
        <main className='p-4 bg-background min-h-screen text-text'>
            <div className="projects grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsModalOpen(true)}
                    className="project p-4 border border-gray-700 rounded-md bg-dark shadow-md hover:shadow-lg transition duration-300"
                >
                    New Project
                    <i className="ri-link ml-2"></i>
                </motion.button>

                {project.map((project) => (
                    <motion.div
                        key={project._id}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                            navigate(`/project`, {
                                state: { project }
                            });
                        }}
                        className="project flex flex-col gap-2 cursor-pointer p-4 border border-gray-700 rounded-md bg-dark shadow-md hover:shadow-lg transition duration-300"
                    >
                        <h2 className='font-semibold text-lg'>{project.name}</h2>
                        <div className="flex gap-2">
                            <p><small><i className="ri-user-line"></i> Collaborators</small> :</p>
                            {project.users.length}
                        </div>
                    </motion.div>
                ))}
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.5 }}
                        className="bg-dark p-6 rounded-md shadow-md w-1/3"
                    >
                        <h2 className="text-xl mb-4">Create New Project</h2>
                        <form onSubmit={createProject}>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-text">Project Name</label>
                                <input
                                    onChange={(e) => setProjectName(e.target.value)}
                                    value={projectName}
                                    type="text" className="mt-1 block w-full p-2 border border-gray-700 rounded-md bg-background text-text" required />
                            </div>
                            <div className="flex justify-end">
                                <button type="button" className="mr-2 px-4 py-2 bg-gray-700 rounded-md text-text" onClick={() => setIsModalOpen(false)}>Cancel</button>
                                <button type="submit" className="px-4 py-2 bg-primary text-text rounded-md">Create</button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </main>
    );
};

export default Home;
