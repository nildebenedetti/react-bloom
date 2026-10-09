import { useState } from "react";
import { useNavigate } from "react-router";
import { useAuthContext } from "../contexts/AuthContext.jsx";
import { TIERS } from '../components/utils/tier.js';
import { EMOTIONS } from "../components/utils/emotions.js";
import { CATEGORY_DEFS } from '../components/utils/categories.js'
import { fetchData, ENDPOINTS } from "../utils/api.js";

function RecordCreate() {
    const navigate = useNavigate();
    const { user } = useAuthContext();
    // construct FormData
    const [formData, setFormData] = useState({
        title: '',
        date: '',
        tier_id: '',
        category_id: '',
        image: '',
        image_alt: '',
        description: '',
        emotions: [],
        visibility: 'public',
        user_id: user.id,


    });
    const [ isLoading, setIsLoading] = useState(false);
    const [ errorMsg, setErrorMsg ] = useState('');
    const [ fieldErrors, setFieldErrors ] = useState({});

    const handleChange = (e) => {
        const { name, value, type, files } = e.target;
        // for file inputs the value is a fake path string: we need the File object
        const nextValue = type === 'file' ? (files?.[0] || '') : value;
        setFormData((prev) => ({
            ...prev,
            [name]: nextValue,
        }));
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // build payload
        const payload = new FormData();

        payload.append('title', formData.title);
        payload.append('date', formData.date);
        payload.append('tier_id', formData.tier_id);
        payload.append('category_id', formData.category_id);
        payload.append('description', formData.description);
        payload.append('user_id', formData.user_id);
        // handle laravel array
        formData.emotions.forEach((emotionId) => {
            payload.append('emotions[]', emotionId);
        })

        // image file + alt are NULLABLE
        if (formData.image) {
            payload.append('image', formData.image);
        }

        if (formData.image_alt) {
            payload.append('image_alt', formData.image_alt);
        }

        if (formData.visibility) {
            payload.append('visibility', formData.visibility);
        }

        setIsLoading(true);
        setErrorMsg('');
        setFieldErrors({});

            try {
                const response = await fetchData(ENDPOINTS.private.records, {
                    method: 'POST',
                    body: payload,
                })

                console.log('Record created:', response);
                navigate('/my-records');

            } catch(error) {

                // Laravel 422: error.data.errors = { title: ["..."], ... }
                if (error.data?.errors) {
                    setFieldErrors(error.data.errors);
                }
                setErrorMsg(error.message);
                console.error(error);

            } finally {
                setIsLoading(false);
            }


        }
        
    

    return <>
        <section className="header px-2 pt-3 ">
            <h2 className="title my-4 fs-1">Add Record Details</h2>
        </section>
        <form onSubmit={handleSubmit} className="pt-3 pb-5">
        {/* Title */}
        <div className="mb-3">
            <label htmlFor="title" className="form-label fw-medium fs-4">
            Title
            </label>
            <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className="form-control"
            required
            maxLength={200}
            />
        </div>

        {/* Date */}
        <div className="mb-3">
            <label htmlFor="date" className="form-label fw-medium fs-4">
            Date
            </label>
            <input
            type="date"
            id="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            className="form-control"
            required
            />
        </div>

        {/* Tier Radio Options */}
        <p className="fw-medium fs-4">Impact Tier</p>
        <p className="fw-medium fst-italic fs-6">Select <span className="fw-bold">one </span> tier to size the impact of your achievement.</p>
        <div className="mb-3 border rounded p-2 d-flex flex-wrap align-items-center gap-3">
            { TIERS.map( (tier) => {
                return <div key={tier.id} className="form-check form-check-inline m-0">
                <input className="form-check-input"
                    type="radio"
                    name="tier_id" 
                    id={`tier-${tier.id}`}
                    value={tier.id}
                    checked={formData.tier_id === String(tier.id)}
                    onChange={handleChange}
                    required
                />
                <label className="form-check-label ms-1" htmlFor={`tier-${tier.id}`}>{tier.label}</label>
                </div>}
                
                )}

            </div>


        {/* Category */}
        <div className="mb-3">
            <label htmlFor="category" className="form-label fw-medium fs-4">
                Category
            </label>
            <select
                id="category"
                name="category_id"
                value={formData.category_id}
                onChange={handleChange}
                className={`form-select mt-2`}
                required
            >
                <option value="">Select a Category</option>
                {CATEGORY_DEFS.map((cat) => (
                <option key={cat.id} value={cat.id}>
                    {cat.name}
                </option>
                ))}
            </select>
            
        </div>
        {/* Image Section */}
        <p className="fw-medium fs-4">Add Image </p>
        <p className="fw-medium fs-5">If you wish, add an image to your Record.</p>
        <label htmlFor="image" className="form-label fs-5 fst-italic">Choose Image</label>
        <input type="file"
                name="image"
                id="image"
                accept="image/*"
                className="form-control mt-2 mb-3"
                onChange={handleChange}
                />

        {/* Image Alt */}
        <div className="mb-3">
            <label htmlFor="image_alt" className="form-label fw-medium fs-5">
            Add a description for your image.
            </label>
            <input
            type="text"
            id="image_alt"
            name="image_alt"
            value={formData.image_alt}
            onChange={handleChange}
            className="form-control"
            maxLength={255}
            />
        </div>

        {/* Description */}
        <div className="mb-3">
            <label htmlFor="description" className="form-label fw-medium fs-4">
            Description
            </label>
            <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="form-control"
            rows={6}
            required
            ></textarea>
        </div>

        {/* Emotions Checkboxes */}
        <p className="fw-medium fs-4">Emotions</p>
        <p className="fw-medium fst-italic fs-6">Select <span className="fw-bold">one or more</span> emotions to remember how this achievement made you feel.</p>
        <div className="mb-3 border rounded p-2 d-flex flex-wrap align-items-center gap-3">
        {EMOTIONS.map((emotion) => (
            <div key={emotion.id} className="form-check form-check-inline m-0">
                <input
                    className="form-check-input"
                    type="checkbox"
                    id={`emotion-${emotion.id}`}
                    name="emotions"
                    value={emotion.id}
                    checked={formData.emotions.includes(emotion.id)}
                    onChange={(e) => {
                        if (e.target.checked) {
                            setFormData((prev) => ({
                                ...prev,
                                emotions: [...prev.emotions, emotion.id],
                            }));
                        } else {
                            setFormData((prev) => ({
                                ...prev,
                                emotions: prev.emotions.filter((id) => id !== emotion.id),
                            }));
                        }
                    }}
                />
                <label className="form-check-label ms-1" htmlFor={`emotion-${emotion.id}`}>
                    {emotion.label}
                </label>
            </div>
        ))}
        </div>

        {/* Visibility / Public */}
        <p className="fw-medium fs-4">Visibility</p>
        <p className="fw-medium fst-italic fs-6">Select desired visibility.<br/> You can always update it later. <br/> Public Records will be added to Blooming Meadow feed!</p>
        <div className="mb-3">
            <select id="visibility" name="visibility" value={formData.visibility} onChange={handleChange} className="form-select" required>
            <option value="public">Public</option>
            <option value="private">Private</option>
            </select>
        </div>
        { errorMsg && (
            <div className="alert alert-danger">
                <p className="mb-2">
                    Something went wrong while saving your Record: {errorMsg}
                </p>
                { Object.keys(fieldErrors).length > 0 && (
                    <ul className="mb-0">
                        { Object.entries(fieldErrors).map(([field, messages]) => (
                            <li key={field}>
                                <strong>{field}</strong>: { [].concat(messages).join(' ') }
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        )}
        <div className="btn-wrapper d-flex justify-content-end py-3">
            <button type="submit" className="btn-action " disabled={isLoading}>
                { isLoading ? 'Saving...' : 'Submit' }
            </button>
        </div>
        </form>
    </>
}
export default RecordCreate