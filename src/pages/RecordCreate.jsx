import { useState } from "react";
import { TIERS } from '../components/utils/tier.js';
import { EMOTIONS } from "../components/utils/emotions.js";
import { CATEGORY_DEFS } from '../components/utils/categories.js'

function RecordCreate() {
    // construct FormData
    const [FormData, setFormData] = useState({
        title: '',
        date: '',
        tier_id: '',
        category_id: '',
        image_path: '',
        image_alt: '',
        description: '',
        emotions: [],
        visibility: ''


    });

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData( (prev) => ({
            ...prev,
            [name]: value,

        })
        );

    }

    const handleSubmit = (e) => {
        e.preventDefault();
        
        console.log(FormData);
        
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
            value={FormData.title}
            onChange={handleChange}
            className="form-control"
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
            value={FormData.date}
            onChange={handleChange}
            className="form-control"
            />
        </div>

        {/* Tier Radio Options */}
        <p className="fw-medium fs-4">Impact Tier</p>
        <p className="fw-medium fst-italic fs-6">Select <span className="fw-bold">one </span> tier to size the impact of your achievement.</p>
        <div className="mb-3 border rounded p-2 d-flex flex-wrap align-items-center gap-3">
            <div className="form-check form-check-inline m-0">
                <input
                    className="form-check-input"
                    type="radio"
                    name="tier"
                    id="tier-small-win"
                    value="1"
                />
                <label className="form-check-label ms-1" htmlFor="tier-small-win">
                    Small Win
                </label>
            </div>
            { TIERS.map( (tier) => {
                return <div key={tier.id} className="form-check form-check-inline m-0">
                <label className="form-check-label ms-1" htmlFor={`${tier.id}`}>{tier.label}</label>
                <input className="form-check-input"
                    type="radio"
                    name="tier" 
                    value={tier.id}
                    checked={FormData.tier === tier.id}
                    onChange={handleChange}
                />
                </div>}
                
                )}

            </div>


        {/* Category */}
        <div className="mb-3">
            <label htmlFor="category" className="form-label fw-medium fs-4">
                Category *
            </label>
            <select
                id="category"
                name="category_id"
                value={FormData.category_id}
                onChange={handleChange}
                className={`form-select mt-2`}
            >
                <option value={FormData.title}>Select a Category</option>
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
        <label htmlFor="image_path" className="form-label fs-5 fst-italic">Choose Image</label>
        <input type="file"
                name="iamge_path"
                id="image_path"
                accept="image/*"
                className="form-control mt-2 mb-3"
                onChange={(e) => {
                    const file = e.target.files[0]
                    if (file) {
                        setFormData( (prev) => ({
                            ...prev,
                            image_path: file,
                        }));
                    }
                }}
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
            value={FormData.image_alt}
            onChange={handleChange}
            className="form-control"
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
            value={FormData.description}
            onChange={handleChange}
            className="form-control"
            rows={6}
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
                    checked={FormData.emotions.includes(emotion.id)}
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
            <select id="visibility" name="visibility" value={FormData.visibility} onChange={handleChange} className="form-select">
            <option value="public">Public</option>
            <option value="private">Private</option>
            </select>
        </div>
        <div className="btn-wrapper d-flex justify-content-end py-3">
            <button type="submit" className="btn-action ">Submit</button>
        </div>
        </form>
    </>
}
export default RecordCreate