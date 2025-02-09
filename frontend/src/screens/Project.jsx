import React, { useState, useContext, useEffect, useRef } from 'react';
import { UserContext } from '../context/user.context';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from '../config/axios';
import { initializeSocket, receiveMessage, sendMessage } from '../config/socket';
import Markdown from 'markdown-to-jsx';
import hljs from 'highlight.js';
import { getWebContainer } from '../../config/webContainer';
import { motion } from 'framer-motion';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function SyntaxHighlightedCode(props) {
    const ref = useRef(null);

    React.useEffect(() => {
        if (ref.current && props.className?.includes('lang-') && window.hljs) {
            window.hljs.highlightElement(ref.current);
            ref.current.removeAttribute('data-highlighted');
        }
    }, [props.className, props.children]);

    return <code {...props} ref={ref} />;
}

const Project = () => {
    const location = useLocation();
    const [isSidePanelOpen, setIsSidePanelOpen] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedUserId, setSelectedUserId] = useState(new Set());
    const [project, setProject] = useState(location.state.project);
    const [message, setMessage] = useState('');
    const [isSending, setIsSending] = useState(false); // State to track if a message is being sent
    const { user } = useContext(UserContext);
    const messageBox = React.createRef();
    const [users, setUsers] = useState([]);
    const [messages, setMessages] = useState([]);
    const [fileTree, setFileTree] = useState({});
    const [currentFile, setCurrentFile] = useState(null);
    const [openFiles, setOpenFiles] = useState([]);
    const [webContainer, setWebContainer] = useState(null);
    const [iframeUrl, setIframeUrl] = useState(null);
    const [runProcess, setRunProcess] = useState(null);

    const handleUserClick = (id) => {
        setSelectedUserId(prevSelectedUserId => {
            const newSelectedUserId = new Set(prevSelectedUserId);
            if (newSelectedUserId.has(id)) {
                newSelectedUserId.delete(id);
            } else {
                newSelectedUserId.add(id);
            }
            return newSelectedUserId;
        });
    };

    function addCollaborators() {
        axios.put("/projects/add-user", {
            projectId: location.state.project._id,
            users: Array.from(selectedUserId)
        }).then(res => {
            setIsModalOpen(false);
        }).catch(err => {
            console.log(err);
        });
    }

    const send = () => {
        if (message.trim() && !isSending) {
            setIsSending(true);
            sendMessage('project-message', {
                message,
                sender: user
            });
            setMessages(prevMessages => [...prevMessages, { sender: user, message }]);
            setMessage("");
            setIsSending(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !isSending) {
            send();
        }
    };

    function WriteAiMessage(message) {
        const messageObject = JSON.parse(message);
        return (
            <div className='overflow-auto bg-dark text-text rounded-sm p-2'>
                <Markdown
                    children={messageObject.text}
                    options={{
                        overrides: {
                            code: SyntaxHighlightedCode,
                        },
                    }}
                />
            </div>
        );
    }

    useEffect(() => {
        initializeSocket(project._id);
        getWebContainer().then(container => {
            console.log('WebContainer initialized:', container);
            setWebContainer(container);
        }).catch(err => {
            console.error('Failed to get web container:', err);
        });

        receiveMessage('project-message', data => {
            if (data.sender._id == 'ai') {
                const message = JSON.parse(data.message);
                if (webContainer && webContainer.mount) {
                    webContainer.mount(message.fileTree);
                }
                if (message.fileTree) {
                    setFileTree(message.fileTree || {});
                }
                setMessages(prevMessages => [...prevMessages, data]);
            } else {
                setMessages(prevMessages => [...prevMessages, data]);
            }
        });

        axios.get(`/projects/get-project/${location.state.project._id}`).then(res => {
            setProject(res.data.project);
            setFileTree(res.data.project.fileTree || {});
        }).catch(err => {
            console.error('Failed to get project:', err);
        });

        axios.get('/users/all').then(res => {
            setUsers(res.data.users);
        }).catch(err => {
            console.error('Failed to get users:', err);
        });
    }, [project._id]);

    function saveFileTree(ft) {
        axios.put('/projects/update-file-tree', {
            projectId: project._id,
            fileTree: ft
        }).then(res => {
            console.log(res.data);
        }).catch(err => {
            console.error('Failed to update file tree:', err);
        });
    }

    const runProject = async () => {
        try {
            if (webContainer && webContainer.mount) {
                console.log('Running project with webContainer:', webContainer);
    
                // Mount the file tree
                await webContainer.mount(fileTree);
                console.log('File tree mounted successfully.');
    
                // Install dependencies
                const installProcess = await webContainer.spawn("npm", ["install"]);
                installProcess.output.pipeTo(new WritableStream({
                    write(chunk) {
                        console.log('Install output:', chunk);
                    }
                }));
                console.log('Dependencies installed successfully.');
    
                // Kill any existing run process
                if (runProcess) {
                    runProcess.kill();
                    console.log('Existing run process killed.');
                }
    
                // Start the project
                let tempRunProcess = await webContainer.spawn("npm", ["start"]);
                tempRunProcess.output.pipeTo(new WritableStream({
                    write(chunk) {
                        console.log('Run output:', chunk);
                    }
                }));
                setRunProcess(tempRunProcess);
                console.log('Project started successfully.');
    
                // Handle server-ready event
                webContainer.on('server-ready', (port, url) => {
                    console.log('Server ready at:', url);
                    setIframeUrl(url);
                });
            } else {
                console.error('webContainer or webContainer.mount is null');
            }
        } catch (error) {
            console.error('Error running project:', error);
        }
    };
    

    return (
        <main className='h-screen w-screen flex bg-background text-text'>
            <ToastContainer />
            <section className="left relative flex flex-col h-screen min-w-96 bg-dark shadow-md">
                <header className='flex justify-between items-center p-2 px-4 w-full bg-gray-700 absolute z-10 top-0'>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className='flex gap-2' onClick={() => setIsModalOpen(true)}
                    >
                        <i className="ri-add-fill mr-1"></i>
                        <p>Add collaborator</p>
                    </motion.button>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setIsSidePanelOpen(!isSidePanelOpen)} className='p-2'
                    >
                        <i className="ri-group-fill"></i>
                    </motion.button>
                </header>
                <div className="conversation-area pt-14 pb-10 flex-grow flex flex-col h-full relative">
                    <div
                        ref={messageBox}
                        className="message-box p-1 flex-grow flex flex-col gap-1 overflow-auto max-h-full scrollbar-hide"
                    >
                        {messages.map((msg, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: -20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={`${msg.sender._id === 'ai' ? 'max-w-80' : 'max-w-52'} ${msg.sender._id == user._id.toString() && 'ml-auto'}  message flex flex-col p-2 bg-gray-700 w-fit rounded-md`}
                            >
                                <small className='opacity-65 text-xs'>{msg.sender.email}</small>
                                <div className='text-sm'>
                                    {msg.sender._id === 'ai' ?
                                        WriteAiMessage(msg.message)
                                        : <p>{msg.message}</p>}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                    <div className="inputField w-full flex absolute bottom-0">
                        <input
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            onKeyPress={handleKeyPress}
                            className='p-2 px-4 border-none outline-none flex-grow bg-background text-text' type="text" placeholder='Enter message' />
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={send}
                            className='px-5 bg-primary text-text'
                        >
                            <i className="ri-send-plane-fill"></i>
                        </motion.button>
                    </div>
                </div>
                <motion.div
                    initial={{ x: '-100%' }}
                    animate={{ x: isSidePanelOpen ? '0%' : '-100%' }}
                    className={`sidePanel w-full h-full flex flex-col gap-2 bg-gray-700 absolute transition-all`}
                >
                    <header className='flex justify-between items-center px-4 p-2 bg-gray-800'>
                        <h1 className='font-semibold text-lg'>Collaborators</h1>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setIsSidePanelOpen(!isSidePanelOpen)} className='p-2'
                        >
                            <i className="ri-close-fill"></i>
                        </motion.button>
                    </header>
                    <div className="users flex flex-col gap-2">
                        {project.users && project.users.map(user => (
                            <div key={user._id} className="user cursor-pointer hover:bg-gray-800 p-2 flex gap-2 items-center">
                                <div className='aspect-square rounded-full w-fit h-fit flex items-center justify-center p-5 text-text bg-primary'>
                                    <i className="ri-user-fill absolute"></i>
                                </div>
                                <h1 className='font-semibold text-lg'>{user.email}</h1>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </section>
            <section className="right bg-gray-800 flex-grow h-full flex">
                <div className="explorer h-full max-w-64 min-w-52 bg-gray-700">
                    <div className="file-tree w-full">
                        {Object.keys(fileTree).map((file, index) => (
                            <motion.button
                                key={index}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => {
                                    setCurrentFile(file);
                                    setOpenFiles([...new Set([...openFiles, file])]);
                                }}
                                className="tree-element cursor-pointer p-2 px-4 flex items-center gap-2 bg-gray-800 w-full"
                            >
                                <p className='font-semibold text-lg'>{file}</p>
                            </motion.button>
                        ))}
                    </div>
                </div>
                <div className="code-editor flex flex-col flex-grow h-full shrink">
                    <div className="top flex justify-between w-full">
                        <div className="files flex">
                            {openFiles.map((file, index) => (
                                <motion.button
                                    key={index}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => setCurrentFile(file)}
                                    className={`open-file cursor-pointer p-2 px-4 flex items-center w-fit gap-2 bg-gray-800 ${currentFile === file ? 'bg-gray-900' : ''}`}
                                >
                                    <p className='font-semibold text-lg'>{file}</p>
                                </motion.button>
                            ))}
                        </div>
                        <div className="actions flex gap-2">
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={runProject}
                                className='p-2 px-4 bg-primary text-text'
                            >
                                run
                            </motion.button>
                        </div>
                    </div>
                    <div className="bottom flex flex-grow max-w-full shrink overflow-auto">
                        {fileTree[currentFile] && (
                            <div className="code-editor-area h-full overflow-auto flex-grow bg-gray-800">
                                <pre className="hljs h-full">
                                    <code
                                        className="hljs h-full outline-none"
                                        contentEditable
                                        suppressContentEditableWarning
                                        onBlur={(e) => {
                                            const updatedContent = e.target.innerText;
                                            const ft = {
                                                ...fileTree,
                                                [currentFile]: {
                                                    file: {
                                                        contents: updatedContent
                                                    }
                                                }
                                            };
                                            setFileTree(ft);
                                            saveFileTree(ft);
                                        }}
                                        dangerouslySetInnerHTML={{ __html: hljs.highlight('javascript', fileTree[currentFile].file.contents).value }}
                                        style={{
                                            whiteSpace: 'pre-wrap',
                                            paddingBottom: '25rem',
                                            counterSet: 'line-numbering',
                                        }}
                                    />
                                </pre>
                            </div>
                        )}
                    </div>
                </div>
                {iframeUrl && webContainer && (
                    <div className="flex min-w-96 flex-col h-full">
                        <div className="address-bar">
                            <input type="text"
                                onChange={(e) => setIframeUrl(e.target.value)}
                                value={iframeUrl} className="w-full p-2 px-4 bg-gray-700 text-text" />
                        </div>
                        <iframe src={iframeUrl} className="w-full h-full"></iframe>
                    </div>
                )}
            </section>
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.5 }}
                        className="bg-dark p-4 rounded-md w-96 max-w-full relative"
                    >
                        <header className='flex justify-between items-center mb-4'>
                            <h2 className='text-xl font-semibold'>Select User</h2>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setIsModalOpen(false)} className='p-2'
                            >
                                <i className="ri-close-fill"></i>
                            </motion.button>
                        </header>
                        <div className="users-list flex flex-col gap-2 mb-16 max-h-96 overflow-auto">
                            {users.map(user => (
                                <div key={user.id} className={`user cursor-pointer hover:bg-gray-800 ${Array.from(selectedUserId).indexOf(user._id) != -1 ? 'bg-gray-800' : ""} p-2 flex gap-2 items-center`} onClick={() => handleUserClick(user._id)}>
                                    <div className='aspect-square relative rounded-full w-fit h-fit flex items-center justify-center p-5 text-text bg-primary'>
                                        <i className="ri-user-fill absolute"></i>
                                    </div>
                                    <h1 className='font-semibold text-lg'>{user.email}</h1>
                                </div>
                            ))}
                        </div>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={addCollaborators}
                            className='absolute bottom-4 left-1/2 transform -translate-x-1/2 px-4 py-2 bg-primary text-text rounded-md'
                        >
                            Add Collaborators
                        </motion.button>
                    </motion.div>
                </div>
            )}
        </main>
    );
};

export default Project;
