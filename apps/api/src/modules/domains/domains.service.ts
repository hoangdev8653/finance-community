import { Injectable } from '@nestjs/common';
import { DomainsRepository } from '../../database/repositories/domains.repository';

@Injectable()
export class DomainsService {
  constructor(private readonly domainsRepository: DomainsRepository) {}

  getDomains() {
    return this.domainsRepository.findAll();
  }
}
