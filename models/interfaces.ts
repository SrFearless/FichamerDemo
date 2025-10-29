export interface IPage {
    id: string;
    title: string;
    content: string;
    image?: string;
}

export interface IQuestion {
    id: string;
    text: string;
    options: string[];
    type: 'single' | 'multiple';
}

export interface IUserResponse {
    questionId: string;
    selectedOptions: string[];
    timestamp: Date;
}