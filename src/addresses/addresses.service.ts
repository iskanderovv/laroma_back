import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Address } from './address.schema';
import { CreateAddressDto, UpdateAddressDto } from './dto/address.dto';

@Injectable()
export class AddressesService {
  constructor(
    @InjectModel('Address') private readonly addressModel: Model<Address>,
  ) {}

  async create(userId: string, createAddressDto: CreateAddressDto): Promise<Address> {
    const addressData = {
      ...createAddressDto,
      userId,
    };

    // If this is the first address or explicitly set as default
    const existingAddresses = await this.addressModel.find({ userId });
    if (existingAddresses.length === 0 || createAddressDto.isDefault) {
      addressData.isDefault = true;
    }

    const address = new this.addressModel(addressData);
    return await address.save();
  }

  async findAll(userId: string): Promise<Address[]> {
    return this.addressModel
      .find({ userId })
      .sort({ isDefault: -1, createdAt: -1 })
      .exec();
  }

  async findOne(userId: string, id: string): Promise<Address> {
    const address = await this.addressModel.findOne({ _id: id, userId }).exec();
    if (!address) {
      throw new NotFoundException('Address not found');
    }
    return address;
  }

  async update(userId: string, id: string, updateAddressDto: UpdateAddressDto): Promise<Address> {
    const address = await this.findOne(userId, id);
    
    Object.assign(address, updateAddressDto);
    return await address.save();
  }

  async remove(userId: string, id: string): Promise<void> {
    const address = await this.findOne(userId, id);
    
    // Check if this is the only address
    const addressCount = await this.addressModel.countDocuments({ userId });
    if (addressCount <= 1) {
      throw new BadRequestException('Cannot delete the last address');
    }

    // If deleting default address, set another one as default
    if (address.isDefault) {
      const nextAddress = await this.addressModel
        .findOne({ userId, _id: { $ne: id } })
        .exec();
      if (nextAddress) {
        nextAddress.isDefault = true;
        await nextAddress.save();
      }
    }

    await this.addressModel.findByIdAndDelete(id);
  }

  async setDefault(userId: string, id: string): Promise<Address> {
    const address = await this.findOne(userId, id);
    
    // Remove default from other addresses
    await this.addressModel.updateMany(
      { userId, _id: { $ne: id } },
      { isDefault: false }
    );

    // Set this address as default
    address.isDefault = true;
    return await address.save();
  }
}