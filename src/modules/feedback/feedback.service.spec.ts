import { Test, TestingModule } from '@nestjs/testing';
import { FeedbackService } from './feedback.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Feedback } from './entities/feedback.entity';
import { FeedbackAttachmentService } from './feedback-attachment.service';
import {Between, IsNull} from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { FeedbackCategory } from './enums/feedback-category.enum';
import { FeedbackStatus } from './enums/feedback-status.enum';
import {FeedbackSortField, PaginationInput, SortDirection} from "./dto/pagination.input";

describe('FeedbackService', () => {
  let service: FeedbackService;
  
  const mockFeedbackRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    findAndCount: jest.fn(),
  };
  
  const mockFeedbackAttachmentService = {
    create: jest.fn(),
    findByFeedbackId: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FeedbackService,
        { provide: getRepositoryToken(Feedback), useValue: mockFeedbackRepository },
        { provide: FeedbackAttachmentService, useValue: mockFeedbackAttachmentService },
      ],
    }).compile();

    service = module.get<FeedbackService>(FeedbackService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should be able to create feedback without attachment', async () => {
      const userID = '35240617-541a-4124-b68e-fffa3ff62b95'
      const createFeedbackData = {
        userId: userID,
        content: 'Test feedback',
        category: FeedbackCategory.FEATURE,
      };
      
      const mockFeedback = { id: '00eeafe3-7685-465b-a68e-d6067885cfc6', ...createFeedbackData };
      mockFeedbackRepository.create.mockReturnValue(mockFeedback);
      mockFeedbackRepository.save.mockResolvedValue(mockFeedback);
      
      // Act
      const result = await service.create(createFeedbackData);
      
      // Assert
      expect(result).toEqual(mockFeedback);
      expect(mockFeedbackRepository.create).toHaveBeenCalledWith({
        userId: userID,
        content: 'Test feedback',
        category: FeedbackCategory.FEATURE,
      });
      expect(mockFeedbackRepository.save).toHaveBeenCalledWith(mockFeedback);
      expect(mockFeedbackAttachmentService.create).not.toHaveBeenCalled();
    });
    
    it('should be able to create feedback with attachment', async () => {
      const userID = '35240617-541a-4124-b68e-fffa3ff62b95'
      const feedbackID = '0cd99ac2-8665-497f-b0de-45b9e9744493'

      const createFeedbackData = {
        userId: userID,
        content: 'Test feedback',
        category: FeedbackCategory.BUG,
        attachmentUrl: 'https://example.com/feedback.jpg',
        attachmentMetadata: {
          filename: 'feedback.jpg',
          mimetype: 'feedback/jpeg',
        },
      };
      
      const mockFeedback = {
        id: feedbackID,
        userId: userID,
        content: 'Test feedback',
        category: FeedbackCategory.BUG
      };
      mockFeedbackRepository.create.mockReturnValue(mockFeedback);
      mockFeedbackRepository.save.mockResolvedValue(mockFeedback);
      
      // Act
      const result = await service.create(createFeedbackData);
      
      // Assert
      expect(result).toEqual(mockFeedback);
      expect(mockFeedbackAttachmentService.create).toHaveBeenCalledWith({
        feedbackId: feedbackID,
        url: 'https://example.com/feedback.jpg',
        originalFilename: 'feedback.jpg',
        mimeType: 'feedback/jpeg',
      });
    });
  });

  describe('findAll', () => {
    it('should return paginated feedback with default parameters', async () => {
      const mockFeedbackItems = [
        { id: '0cd99ac2-8665-497f-b0de-45b9e9744491', content: 'Test feedback 1', category: FeedbackCategory.FEATURE },
        { id: '0cd99ac2-8665-497f-b0de-45b9e9744492', content: 'Test feedback 2', category: FeedbackCategory.BUG },
        { id: '0cd99ac2-8665-497f-b0de-45b9e9744493', content: 'Test feedback 2', category: FeedbackCategory.GENERAL },
      ];

      mockFeedbackRepository.findAndCount.mockResolvedValue([mockFeedbackItems, 3]);

      const defaultFilter = {};
      const defaultPagination = new PaginationInput();

      // Act
      const result = await service.findAll(defaultFilter, defaultPagination);

      // Assert
      expect(result).toEqual({
        items: mockFeedbackItems,
        total: 3,
        page: 1,
        limit: 10,
        pages: 1,
      });

      expect(mockFeedbackRepository.findAndCount).toHaveBeenCalledWith({
        where: { deletedAt: IsNull() },
        order: { createdAt: 'DESC' },
        skip: 0,
        take: 10,
      });
    });

    it('should apply category filter correctly', async () => {
      // Arrange
      const mockFeedbackItems = [
        { id: '0cd99ac2-8665-497f-b0de-45b9e9744493', content: 'Test feedback 1', category: FeedbackCategory.FEATURE },
      ];

      mockFeedbackRepository.findAndCount.mockResolvedValue([mockFeedbackItems, 1]);

      const filter = { category: FeedbackCategory.FEATURE };
      const pagination = new PaginationInput();

      // Act
      const result = await service.findAll(filter, pagination);

      // Assert
      expect(result.items).toEqual(mockFeedbackItems);
      expect(result.total).toEqual(1);

      expect(mockFeedbackRepository.findAndCount).toHaveBeenCalledWith({
        where: {
          deletedAt: IsNull(),
          category: FeedbackCategory.FEATURE
        },
        order: { createdAt: 'DESC' },
        skip: 0,
        take: 10,
      });
    });

    it('should apply status filter correctly', async () => {
      const mockFeedbackItems = [
        { id: '0cd99ac2-8665-497f-b0de-45b9e9744491', content: 'Test feedback 1', status: FeedbackStatus.REVIEWED },
        { id: '0cd99ac2-8665-497f-b0de-45b9e9744492', content: 'Test feedback 2', status: FeedbackStatus.REVIEWED },
      ];

      mockFeedbackRepository.findAndCount.mockResolvedValue([mockFeedbackItems, 2]);

      const filter = { status: FeedbackStatus.REVIEWED };
      const pagination = new PaginationInput();

      // Act
      const result = await service.findAll(filter, pagination);

      // Assert
      expect(result.items).toEqual(mockFeedbackItems);
      expect(result.total).toEqual(2);

      expect(mockFeedbackRepository.findAndCount).toHaveBeenCalledWith({
        where: {
          deletedAt: IsNull(),
          status: FeedbackStatus.REVIEWED
        },
        order: { createdAt: 'DESC' },
        skip: 0,
        take: 10,
      });
    });

    it('should apply date range filter correctly', async () => {
      const mockFeedbackItems = [
        { id: '0cd99ac2-8665-497f-b0de-45b9e9744493', content: 'Test feedback 1', createdAt: new Date('2025-05-02') },
      ];

      mockFeedbackRepository.findAndCount.mockResolvedValue([mockFeedbackItems, 1]);

      const startDate = new Date('2025-05-01');
      const endDate = new Date('2025-05-31');
      const filter = { startDate, endDate };
      const pagination = new PaginationInput();

      // Act
      const result = await service.findAll(filter, pagination);

      // Assert
      expect(result.items).toEqual(mockFeedbackItems);

      expect(mockFeedbackRepository.findAndCount).toHaveBeenCalledWith({
        where: {
          deletedAt: IsNull(),
          createdAt: Between(startDate, endDate)
        },
        order: { createdAt: 'DESC' },
        skip: 0,
        take: 10,
      });
    });

    it('should apply startDate filter without endDate correctly', async () => {
      const mockFeedbackItems = [
        { id: '0cd99ac2-8665-497f-b0de-45b9e9744493', content: 'Test feedback 1', createdAt: new Date('2025-05-02') },
      ];

      mockFeedbackRepository.findAndCount.mockResolvedValue([mockFeedbackItems, 1]);

      const startDate = new Date('2025-05-01');
      const filter = { startDate };
      const pagination = new PaginationInput();

      // Mock Date.now()
      const nowDate = new Date('2025-05-02');
      jest.spyOn(global, 'Date').mockImplementation(() => nowDate as any);

      // Act
      const result = await service.findAll(filter, pagination);

      // Assert
      expect(result.items).toEqual(mockFeedbackItems);

      expect(mockFeedbackRepository.findAndCount).toHaveBeenCalledWith({
        where: {
          deletedAt: IsNull(),
          createdAt: Between(startDate, nowDate)
        },
        order: { createdAt: 'DESC' },
        skip: 0,
        take: 10,
      });

      // Restore Date
      jest.restoreAllMocks();
    });

    it('should calculate pages correctly', async () => {
      const mockFeedbackItems = [
        { id: '0cd99ac2-8665-497f-b0de-45b9e9744493', content: 'Test feedback 1' },
      ];

      mockFeedbackRepository.findAndCount.mockResolvedValue([mockFeedbackItems, 21]);

      const filter = {};
      const pagination = new PaginationInput();

      // Act
      const result = await service.findAll(filter, pagination);

      // Assert
      expect(result.pages).toEqual(3);
      expect(result.total).toEqual(21);
      expect(result.limit).toEqual(10);
    });
  });

  describe('update', () => {
    it('should update feedback status successfully', async () => {
      const adminID = '0ca95906-f714-47ff-9c35-8321455aaa4f'
      const feedbackID = '0cd99ac2-8665-497f-b0de-45b9e9744493'

      const updateFeedbackInput = {
        id: feedbackID,
        status: FeedbackStatus.REVIEWED,
      };
      
      const mockFeedback = { 
        id: feedbackID,
        status: FeedbackStatus.PENDING,
      };
      
      const updatedFeedback = { 
        ...mockFeedback, 
        status: FeedbackStatus.REVIEWED,
      };
      
      mockFeedbackRepository.findOne.mockResolvedValue(mockFeedback);
      mockFeedbackRepository.save.mockResolvedValue(updatedFeedback);
      
      // Act
      const result = await service.update(updateFeedbackInput, adminID);
      
      // Assert
      expect(result).toEqual(updatedFeedback);
      expect(mockFeedbackRepository.findOne).toHaveBeenCalledWith({
        where: {
          id: feedbackID,
          deletedAt: IsNull(),
        },
      });
      expect(mockFeedbackRepository.save).toHaveBeenCalledWith({
        id: feedbackID,
        status: FeedbackStatus.REVIEWED,
      });
    });

    it('should throw error when feedback not found', async () => {
      const adminID = '0ca95906-f714-47ff-9c35-8321455aaa4f'
      const feedbackID = '0cd99ac2-8665-497f-b0de-45b9e9744493'

      mockFeedbackRepository.findOne.mockResolvedValue(null);
      
      // Act & Assert
      await expect(service.update({ id: feedbackID }, adminID))
        .rejects.toThrow(NotFoundException);
    });
  });

  describe('findOne', () => {
    it('should return feedback with attachments', async () => {
      const feedbackID = '0cd99ac2-8665-497f-b0de-45b9e9744493'

      const mockFeedback = { id: feedbackID, content: 'Test feedback' };
      const mockAttachments = [{ url: 'https://example.com/feedback.jpg' }];
      
      mockFeedbackRepository.findOne.mockResolvedValue(mockFeedback);
      mockFeedbackAttachmentService.findByFeedbackId.mockResolvedValue(mockAttachments);
      
      // Act
      const result = await service.findOne(feedbackID);
      
      // Assert
      expect(result).toEqual({
        ...mockFeedback,
        attachments: mockAttachments,
      });
    });

    it('should return feedback without attachments', async () => {
      const feedbackID = '0cd99ac2-8665-497f-b0de-45b9e9744493'

      const mockFeedback = { id: feedbackID, content: 'Test feedback' };
      const mockAttachments: never[] = [];

      mockFeedbackRepository.findOne.mockResolvedValue(mockFeedback);
      mockFeedbackAttachmentService.findByFeedbackId.mockResolvedValue(mockAttachments);

      // Act
      const result = await service.findOne(feedbackID);

      // Assert
      expect(result).toEqual({
        ...mockFeedback,
        attachments: mockAttachments,
      });
    });
    
    it('should throw error when feedback not found', async () => {
      mockFeedbackRepository.findOne.mockResolvedValue(null);
      
      // Act & Assert
      await expect(service.findOne('0cd99ac2-8665-497f-b0de-45b9e9744493'))
        .rejects.toThrow(NotFoundException);
    });
  });
});